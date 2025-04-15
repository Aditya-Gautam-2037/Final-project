import sys
import os
import cv2
import numpy as np
import pandas as pd
from paddleocr import PaddleOCR
import logging

# Suppress all logs from PaddleOCR
logging.getLogger("ppocr").setLevel(logging.ERROR)
os.environ['FLAGS_log_level'] = '3'

def extract_table_by_bbox(image_path, row_threshold=10):
    ocr = PaddleOCR(use_angle_cls=True, lang="en", show_log=False)
    result = ocr.ocr(image_path, cls=True)

    boxes = []
    for line in result:
        for item in line:
            coords = item[0]
            text = item[1][0]
            x_center = sum([pt[0] for pt in coords]) / 4.0
            y_center = sum([pt[1] for pt in coords]) / 4.0
            boxes.append((x_center, y_center, text))

    boxes.sort(key=lambda x: x[1])  # vertical sort

    rows = []
    current_row = []
    last_y = None

    for b in boxes:
        if last_y is None or abs(b[1] - last_y) < row_threshold:
            current_row.append(b)
        else:
            rows.append(current_row)
            current_row = [b]
        last_y = b[1]

    if current_row:
        rows.append(current_row)

    structured_data = []
    for row in rows:
        row.sort(key=lambda x: x[0])  # horizontal sort
        structured_data.append([item[2] for item in row])

    return structured_data

def detect_data_type(values):
    try:
        if all(str(v).isdigit() for v in values): return 'INTEGER'
        float_vals = [float(v) for v in values]
        return 'REAL'
    except:
        return 'TEXT'

def generate_sql(data, table_name):
    df = pd.DataFrame(data)

    # Use the first row as header
    df.columns = df.iloc[0]
    df = df[1:].reset_index(drop=True)

    # Infer data types
    column_types = []
    for col in df.columns:
        sample_values = df[col].astype(str).tolist()
        column_types.append(detect_data_type(sample_values))

    create_stmt = f"CREATE TABLE {table_name} (\n  " + ",\n  ".join(
        f"{col.strip().replace(' ', '_')} {dtype}" for col, dtype in zip(df.columns, column_types)
    ) + "\n);"

    insert_stmts = []
    for _, row in df.iterrows():
        values = []
        for val, dtype in zip(row, column_types):
            val = str(val).replace("'", "''").strip()
            values.append(f"'{val}'" if dtype == 'TEXT' else val)
        stmt = f"INSERT INTO {table_name} ({', '.join(col.strip().replace(' ', '_') for col in df.columns)}) VALUES ({', '.join(values)});"
        insert_stmts.append(stmt)

    return create_stmt + "\n" + "\n".join(insert_stmts)

if __name__ == '__main__':
    if len(sys.argv) != 3:
        sys.exit(1)  # No need to print anything

    image_path = sys.argv[1]
    table_name = sys.argv[2]

    try:
        table_data = extract_table_by_bbox(image_path)
        sql_script = generate_sql(table_data, table_name)
        print(sql_script)
    except Exception as e:
        sys.stderr.write("")  # Silence the error in stdout
        sys.exit(1)
