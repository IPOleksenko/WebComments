import base64
from django.core.exceptions import ValidationError
from PIL import Image
import io

# Function to convert file to base64
def to_base64(file):
    file.seek(0)  # Move the pointer to the beginning of the file
    return base64.b64encode(file.read()).decode('utf-8')

# Function to process image
def process_image(image):
    valid_formats = ['image/jpeg', 'image/gif', 'image/png']
    if image.content_type not in valid_formats:
        raise ValidationError("Invalid image format. Only JPG, GIF, PNG are allowed.")
    
    # Check image size
    img = Image.open(image)
    img_width, img_height = img.size

    if img_width > 320 or img_height > 240:
        # Proportional resizing
        img.thumbnail((320, 240))
    
    # Convert image to RGB if it's in RGBA
    if img.mode == 'RGBA':
        img = img.convert('RGB')
    
    # Save image to byte stream
    image_temp = io.BytesIO()
    img.save(image_temp, format='JPEG')
    image_temp.seek(0)

    # Convert to base64
    file_base64 = to_base64(image_temp)
    return file_base64

# Function to validate text file
def validate_text_file(file):
    # Check file size
    if file.size > 100 * 1024:  # 100 KB
        raise ValidationError("Text file exceeds the 100KB size limit.")
    
    # Check format
    if not file.name.endswith('.txt'):
        raise ValidationError("Invalid file format. Only TXT files are allowed.")
    
    # Convert text file to base64
    file_base64 = to_base64(file)
    return file_base64

# Function to handle uploaded files
def handle_uploaded_file(file):
    # Check file size
    if file.size > 5 * 1024 * 1024:  # Maximum file size 5MB
        raise ValidationError("File size exceeds the 5MB limit.")

    # Process image
    if file.content_type.startswith('image'):
        return process_image(file)

    # Process text file
    elif file.content_type == 'text/plain':
        return validate_text_file(file)

    # Error if the file type is unsupported
    raise ValidationError("Unsupported file type.")
