
let encodebtn = document.getElementById("encodebtn")
let encodeimage1fileinput = document.getElementById("encodeimage1")


let canvasbox = document.getElementById("canvasbox")
let secretTextField = document.getElementById("secretText");

let loadedImage;
let encodedImage;

let decodebtn = document.getElementById("decodebtn")
let decodeimage2fileinput = document.getElementById("decodeimage2")

let decodeimage2;


encodebtn.addEventListener("click", e => {
    console.log("encoding...")
    encodebtn.classList.add("disbaled")
    // load image from encodeimage1fileinput and display in canvasbox
    // Check if a file is selected
    if (encodeimage1fileinput.files && encodeimage1fileinput.files[0]) {
        // Use p5.js loadImage function to load the image
        loadedImage = loadImage(URL.createObjectURL(encodeimage1fileinput.files[0]), () => {
            // Draw the loaded image to the canvasbox div
              createCanvas(loadedImage.width, loadedImage.height).parent('canvasbox');
               image(loadedImage, 0, 0);

            loadedImage.loadPixels();
            console.log("Pixel data:", loadedImage.pixels);



            // Get the text to hide
            let secretText = secretTextField.value;
            console.log("secret message:", secretText)

            // Encode the message in the image
            encodedImage = createImage(loadedImage.width, loadedImage.height);
            encodedImage.copy(loadedImage, 0, 0, loadedImage.width, loadedImage.height, 0, 0, loadedImage.width, loadedImage.height);

            encodedImage.loadPixels()
            console.log("Pixel data:", encodedImage.pixels);

            // Encode the message in the image
            encodeMessage(encodedImage, secretText);

            // Display the modified image
             createCanvas(encodedImage.width, encodedImage.height).parent('canvasbox');
             image(encodedImage, 0, 0);


            // force download the encodedimage

            downloadEncodedImage(encodedImage, 'encoded_image.jpg');
            secretTextField.value = "";



        });
    } else {
        alert("Please select an image file.");
    }
})

decodebtn.addEventListener("click", e => {
    console.log("decoding...")
    decodebtn.classList.add("disbaled")


    //load images - first one is original and second one with message. compare them and find the message inside
    // Check if both files are selected
    if ( decodeimage2fileinput.files && decodeimage2fileinput.files[0]) {
        // Load the two images
        
            loadImage(URL.createObjectURL(decodeimage2fileinput.files[0]), img2 => {
                // Display the image with the hidden message
                  createCanvas(img2.width, img2.height).parent('canvasbox');
                  image(img2, 0, 0);

                img2.loadPixels()
              
                console.log("image 2:", img2)

                // Decode the hidden message
                let decodedMessage = decodeMessage(img2);
                console.log("Decoded Message:", decodedMessage);


                // Enable the decode button after decoding
                //    decodebtn.classList.remove("disabled");


                secretTextField.value = decodedMessage

            });
    } else {
        alert("Please select image files.");
    }

})


// Define the p5.js sketch
function setup() {
}


function draw() {
    noLoop()
}

// Function to encode the message by modifying color channels
function encodeMessage(img, message) {
    let binaryMessage = textToBinary(message) + '00000000'; // Add a null terminator to the binary message
    img.loadPixels();

    let index = 0;
    for (let i = 0; i < img.pixels.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            if (index < binaryMessage.length) {
                // Get the binary value from the message
                let bit = int(binaryMessage[index]);

                // Set the least significant bit of the color channel to the message bit
                img.pixels[i + j] = (img.pixels[i + j] & 0xFE) | bit;

                index++;
            }
        }
    }

    img.updatePixels();
}




function textToBinary(text) {
    let binaryMessage = '';
    for (let i = 0; i < text.length; i++) {
        let binaryChar = text[i].charCodeAt(0).toString(2);
        binaryMessage += '0'.repeat(8 - binaryChar.length) + binaryChar;
    }
    return binaryMessage;
}


function downloadEncodedImage(img, filename) {
    // Create a temporary link
    let link = document.createElement('a');
    // Convert the canvas to data URL
    let dataURL = img.canvas.toDataURL();
    // Set the href attribute of the link to the data URL
    link.href = dataURL;
    // Set the download attribute with the desired filename
    link.download = filename;
    // Append the link to the document
    document.body.appendChild(link);
    // Programmatically trigger a click on the link
    link.click();
    // Remove the link from the document
    document.body.removeChild(link);
}


// Function to decode the hidden message

// Function to decode the message by comparing color channels
function decodeMessage(encodedImage) {
    let binaryMessage = "";
    encodedImage.loadPixels();

    for (let i = 0; i < encodedImage.pixels.length; i += 4) {
        for (let j = 0; j < 3; j++) {
            // Get the least significant bit of the color channel
            let bit = encodedImage.pixels[i + j] & 1;
            binaryMessage += bit;
        }
    }

    // Split the binary message into 8-bit segments and convert to text
    let textMessage = binaryToText(binaryMessage);
    
    // Find the null terminator and cut the message
    let nullIndex = textMessage.indexOf('\u0000');
    if (nullIndex !== -1) {
        textMessage = textMessage.substring(0, nullIndex);
    }
    
    return textMessage;
}



// Function to convert binary to text
function binaryToText(binaryMessage) {
    let textMessage = "";
    for (let i = 0; i < binaryMessage.length; i += 8) {
        let byte = binaryMessage.substr(i, 8);
        textMessage += String.fromCharCode(parseInt(byte, 2));
    }
    return textMessage;
}