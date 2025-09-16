from flask import Flask, request, send_from_directory
import os
import time
from PIL import Image
from flask_cors import CORS

UPLOAD_FOLDER = 'uploads' # Directory to save uploaded files

app = Flask(__name__)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER
CORS(app)

@app.route('/upload', methods=['POST'])
def upload_file():
    if 'file' not in request.files:
        return 'No file part', 400
    file = request.files['file']
    if file.filename == '':
        return 'No selected file', 400
    if file:
        # Generate a unique filename using a timestamp
        filename = f"{int(time.time() * 1000)}.webp"
        filepath = os.path.join(app.config['UPLOAD_FOLDER'], filename)
        
        # Open the uploaded image and convert it to WebP
        try:
            image = Image.open(file.stream)
            # You can adjust quality settings as needed
            image.save(filepath, 'webp', quality=100) 
            return filename
        except Exception as e:
            return str(e), 500

@app.route('/download/<filename>')
def download_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

if __name__ == '__main__':
    os.makedirs(app.config['UPLOAD_FOLDER'], exist_ok=True) 

    app.run(debug=False)