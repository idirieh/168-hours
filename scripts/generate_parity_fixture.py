"""Evaluate the original 168 Hours spreadsheet with sample inputs and write a JSON fixture.

The fixture drives src/lib/calc.parity.test.ts, which checks that the web app's maths
matches the spreadsheet cell for cell.

Usage:
    pip install openpyxl pycel
    python scripts/generate_parity_fixture.py "<template>.xlsx" src/lib/__fixtures__/spreadsheet-parity.json
"""
import ast
import json
import shutil
import sys
import tempfile
from pathlib import Path

# pycel still emits ast.Str, which was removed in Python 3.12.
if not hasattr(ast, 'Str'):
    ast.Str = lambda s='', **kw: ast.Constant(value=s)

import openpyxl
from pycel import ExcelCompiler

SRC, OUT = Path(sys.argv[1]), Path(sys.argv[2])
CUR, IDEAL = '👉 Current Week', '🌈 Ideal Week'

INPUTS = {
    'sleep': {'hoursPerNight': 'C19', 'windDownMinutes': 'C20'},
    'work': {'hoursPerDay': 'C25', 'daysPerWeek': 'C26', 'lunchBreakMinutes': 'C27',
             'commuteMinutesEachWay': 'C28', 'getReadyMinutes': 'C29', 'changeAfterWorkMinutes': 'C30'},
    'food': {'breakfastEatMinutes': 'C35', 'breakfastPrepMinutes': 'C36', 'lunchEatMinutes': 'C38',
             'lunchPrepMinutes': 'C39', 'dinnerEatMinutes': 'C41', 'dinnerPrepMinutes': 'C42'},
    'chores': {'groceryTripsPerWeek': 'C48', 'minutesPerGroceryTrip': 'C49', 'cleaningsPerWeek': 'C50',
               'minutesPerCleaning': 'C51', 'laundryLoadsPerWeek': 'C52', 'minutesPerLaundry': 'C53',
               'miscHoursPerWeek': 'C54'},
    'childcare': {'hoursPerWeekday': 'C59', 'hoursPerWeekendDay': 'C60', 'adminHoursPerWeek': 'C61',
                  'otherHoursPerWeek': 'C62'},
    'fitness': {'exerciseHoursPerWeek': 'C67', 'otherHoursPerWeek': 'C68'},
    'entertainment': {'tvMoviesHours': 'C73', 'socialMediaHours': 'C74', 'readingHours': 'C75',
                      'gamingHours': 'C76', 'otherHours': 'C77'},
    'relationships': {'familyPartnerHours': 'C82', 'otherSocialisingHours': 'C83'},
}

# Result path -> cell (same layout on both week tabs).
OUTPUTS = {
    'breakdown.sleep.sleep': 'F19', 'breakdown.sleep.windDown': 'F20', 'breakdown.sleep.total': 'F21',
    'breakdown.work.official': 'F26', 'breakdown.work.lunch': 'F27', 'breakdown.work.commute': 'F28',
    'breakdown.work.getReady': 'F29', 'breakdown.work.changeAfter': 'F30', 'breakdown.work.total': 'F31',
    'breakdown.food.breakfastMinutesPerDay': 'F36', 'breakdown.food.breakfast': 'F37',
    'breakdown.food.lunchMinutesPerDay': 'F39', 'breakdown.food.lunch': 'F40',
    'breakdown.food.dinnerMinutesPerDay': 'F42', 'breakdown.food.dinner': 'F43', 'breakdown.food.total': 'F44',
    'breakdown.chores.groceries': 'F49', 'breakdown.chores.cleaning': 'F51', 'breakdown.chores.laundry': 'F53',
    'breakdown.chores.total': 'F55',
    'breakdown.childcare.weekdays': 'F59', 'breakdown.childcare.weekends': 'F60',
    'breakdown.childcare.total': 'F63',
    'breakdown.fitness.total': 'F69', 'breakdown.entertainment.total': 'F78',
    'breakdown.relationships.total': 'F84',
    'remainingAfter.sleep': 'F22', 'remainingAfter.work': 'F32', 'remainingAfter.food': 'F45',
    'remainingAfter.chores': 'F56', 'remainingAfter.childcare': 'F64', 'remainingAfter.fitness': 'F70',
    'remainingAfter.entertainment': 'F79', 'remainingAfter.relationships': 'F85',
    'hoursUsed': 'F3', 'monthly.used': 'G3', 'annual.used': 'H3',
    'remaining': 'F4', 'monthlyRemaining': 'G4', 'annualRemaining': 'H4',
}
VS_CURRENT = {  # Ideal tab, column H
    'sleep': 'H7', 'work': 'H8', 'food': 'H9', 'chores': 'H10', 'childcare': 'H11', 'fitness': 'H12',
    'entertainment': 'H13', 'relationships': 'H14', 'free': 'H15', 'used': 'H16',
}

SCENARIOS = [
    {
        'name': 'typical week vs a calmer ideal',
        'current': {
            'sleep': {'hoursPerNight': 7, 'windDownMinutes': 30},
            'work': {'hoursPerDay': 8, 'daysPerWeek': 5, 'lunchBreakMinutes': 45, 'commuteMinutesEachWay': 25,
                     'getReadyMinutes': 30, 'changeAfterWorkMinutes': 10},
            'food': {'breakfastEatMinutes': 10, 'breakfastPrepMinutes': 5, 'lunchEatMinutes': 20,
                     'lunchPrepMinutes': 15, 'dinnerEatMinutes': 30, 'dinnerPrepMinutes': 40},
            'chores': {'groceryTripsPerWeek': 1, 'minutesPerGroceryTrip': 75, 'cleaningsPerWeek': 2,
                       'minutesPerCleaning': 45, 'laundryLoadsPerWeek': 2, 'minutesPerLaundry': 20,
                       'miscHoursPerWeek': 1.5},
            'childcare': {'hoursPerWeekday': 2, 'hoursPerWeekendDay': 4, 'adminHoursPerWeek': 1,
                          'otherHoursPerWeek': 0.5},
            'fitness': {'exerciseHoursPerWeek': 3, 'otherHoursPerWeek': 0.5},
            'entertainment': {'tvMoviesHours': 4, 'socialMediaHours': 4.5, 'readingHours': 3,
                              'gamingHours': 2, 'otherHours': 1},
            'relationships': {'familyPartnerHours': 6, 'otherSocialisingHours': 4},
        },
        'ideal': {
            'sleep': {'hoursPerNight': 8, 'windDownMinutes': 20},
            'work': {'hoursPerDay': 7.5, 'daysPerWeek': 4, 'lunchBreakMinutes': 30, 'commuteMinutesEachWay': 0,
                     'getReadyMinutes': 15, 'changeAfterWorkMinutes': 0},
            'food': {'breakfastEatMinutes': 15, 'breakfastPrepMinutes': 10, 'lunchEatMinutes': 25,
                     'lunchPrepMinutes': 20, 'dinnerEatMinutes': 30, 'dinnerPrepMinutes': 30},
            'chores': {'groceryTripsPerWeek': 1, 'minutesPerGroceryTrip': 60, 'cleaningsPerWeek': 1,
                       'minutesPerCleaning': 60, 'laundryLoadsPerWeek': 2, 'minutesPerLaundry': 15,
                       'miscHoursPerWeek': 1},
            'childcare': {'hoursPerWeekday': 2, 'hoursPerWeekendDay': 5, 'adminHoursPerWeek': 1,
                          'otherHoursPerWeek': 1},
            'fitness': {'exerciseHoursPerWeek': 5, 'otherHoursPerWeek': 1},
            'entertainment': {'tvMoviesHours': 4, 'socialMediaHours': 3, 'readingHours': 7,
                              'gamingHours': 1, 'otherHours': 1},
            'relationships': {'familyPartnerHours': 10, 'otherSocialisingHours': 5},
        },
    },
    {
        'name': 'over-allocated 7-day work week vs empty ideal',
        'current': {
            'sleep': {'hoursPerNight': 9, 'windDownMinutes': 45},
            'work': {'hoursPerDay': 11.5, 'daysPerWeek': 7, 'lunchBreakMinutes': 60, 'commuteMinutesEachWay': 50,
                     'getReadyMinutes': 40, 'changeAfterWorkMinutes': 20},
            'food': {'breakfastEatMinutes': 20, 'breakfastPrepMinutes': 15, 'lunchEatMinutes': 30,
                     'lunchPrepMinutes': 30, 'dinnerEatMinutes': 45, 'dinnerPrepMinutes': 60},
            'chores': {'groceryTripsPerWeek': 2, 'minutesPerGroceryTrip': 90, 'cleaningsPerWeek': 3,
                       'minutesPerCleaning': 60, 'laundryLoadsPerWeek': 3, 'minutesPerLaundry': 30,
                       'miscHoursPerWeek': 2},
            'childcare': {'hoursPerWeekday': 0, 'hoursPerWeekendDay': 0, 'adminHoursPerWeek': 0,
                          'otherHoursPerWeek': 0},
            'fitness': {'exerciseHoursPerWeek': 6, 'otherHoursPerWeek': 2.25},
            'entertainment': {'tvMoviesHours': 10, 'socialMediaHours': 14, 'readingHours': 0,
                              'gamingHours': 5, 'otherHours': 0},
            'relationships': {'familyPartnerHours': 3, 'otherSocialisingHours': 2},
        },
        'ideal': None,  # all zeros
    },
]


def zero_inputs():
    return {area: {k: 0 for k in fields} for area, fields in INPUTS.items()}


def evaluate(path, sheet, inputs):
    wb = openpyxl.load_workbook(path)
    ws = wb[sheet]
    for area, fields in INPUTS.items():
        for key, cell in fields.items():
            ws[cell] = inputs[area][key]
    wb.save(path)
    return ExcelCompiler(filename=str(path))


def main():
    fixtures = []
    for sc in SCENARIOS:
        ideal_inputs = sc['ideal'] or zero_inputs()
        with tempfile.TemporaryDirectory() as tmp:
            path = Path(tmp) / 'sheet.xlsx'
            shutil.copy(SRC, path)
            evaluate(path, CUR, sc['current'])
            xl = evaluate(path, IDEAL, ideal_inputs)
            ev = lambda sheet, cell: float(xl.evaluate(f"'{sheet}'!{cell}"))
            fixtures.append({
                'name': sc['name'],
                'current': sc['current'],
                'ideal': ideal_inputs,
                'expected': {
                    'current': {k: ev(CUR, c) for k, c in OUTPUTS.items()},
                    'ideal': {k: ev(IDEAL, c) for k, c in OUTPUTS.items()},
                    'vsCurrent': {k: ev(IDEAL, c) for k, c in VS_CURRENT.items()},
                },
            })
    OUT.write_text(json.dumps({
        '//': 'Generated by evaluating the original 168 Hours Google Sheets template formulas. Do not edit by hand.',
        'scenarios': fixtures,
    }, indent=2, ensure_ascii=False) + '\n', encoding='utf-8')
    print('wrote', OUT)


main()
