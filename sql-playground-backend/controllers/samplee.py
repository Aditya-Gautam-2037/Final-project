from paddleocr import PaddleOCR; ocr = PaddleOCR(use_angle_cls=True); result = ocr.ocr('sample.jpg', cls=True); print(result)
