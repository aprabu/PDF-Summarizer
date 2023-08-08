const apiKeyRaw = 'xImfIynhSKdCY0t3MiQIT3BlbkFJI6rODmucWu4o3okbn2z5';
const apiKeyStart = 'sk-'

document.getElementById("myRange").oninput = function() {
  var value = (this.value-this.min)/(this.max-this.min)*100
  this.style.background = 'linear-gradient(to right, #49b0e8 0%, #49b0e8 ' + value + '%, #d3d3d3 ' + value + '%, #d3d3d3 100%)'
};

document.addEventListener("DOMContentLoaded", async function () {
    const fileInput = document.getElementById("fileInput");
    const summarizeBtn = document.getElementById("summarizeBtn");
  

    let fileName = "";
    let fileText = "";
    
    summarizeBtn.addEventListener("click", async function (){
        const summaryContainer = document.getElementById('summaryContainer');
        const summaryElement = document.getElementById('summary');
        const summaryHeading = document.getElementById('summaryHeading');
    
        summaryContainer.classList.remove('hidden');
        summaryHeading.textContent="Summary:";
        summaryElement.textContent = "Summarizing "+fileName+", this may take a minute...";
        
        const lenValue = document.getElementById("myRange").value;
        const length = (0.75*lenValue)+"%";
        console.log("LENGTH VALUE: "+length);

        const headers = {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${apiKeyStart}${apiKeyRaw}`
        };
    
        const apiUrl = 'https://api.openai.com/v1/engines/text-davinci-003/completions';
    
        const data = {
            prompt: `Summarize the content of the following document to ${length} of its length, keeping in mind the main premise of the document: ${fileText}`,
            max_tokens: 500,
            temperature: 0.3
        };
    
        const response = await fetch(apiUrl, {
            method: 'POST',
            headers: headers,
            body: JSON.stringify(data)
        })
    
        const result = await response.json();
        
        if (!response.ok) {
            throw new Error('Network response was not ok.');
        }
    
        console.log("result.choices: "+result.choices);
        console.log("result.choices.length: "+result.choices.length);
        if (result.choices && result.choices.length > 0) {
            const summary = result.choices[0].text;
            summaryElement.textContent = summary;
        } else {
            error = new Error('Invalid response format.');
            summaryElement.textContent = 'An error occurred while generating your CrashCourse. Please try again later.\nError: ' + error;
            throw error;
        }
    })

    fileInput.addEventListener("change", async function (event) {
        const fileNameElement = document.getElementById("upload");
        const selectedFile = event.target.files[0];
  
      if (selectedFile && selectedFile.type === "application/pdf") {
        fileName = selectedFile.name;
        fileNameElement.textContent = "Replace: "+fileName;
        summarizeBtn.classList.remove("hidden");


        const reader = new FileReader();
  
        reader.onload = function (e) {
          const pdfData = new Uint8Array(e.target.result);
          const loadingTask = pdfjsLib.getDocument({ data: pdfData });
  
          loadingTask.promise.then(function (pdfDocument) {
            const numPages = pdfDocument.numPages;
            fileText = "";
  
            function extractText(pageNumber) {
              return pdfDocument.getPage(pageNumber).then(function (page) {
                return page.getTextContent().then(function (textContent) {
                  const pageText = textContent.items.map(function (item) {
                    return item.str;
                  }).join(" ");
  
                  fileText += pageText + " ";
  
                  if (pageNumber < numPages) {
                    return extractText(pageNumber + 1);
                  } else {
                    console.log("Parsed all pages");
                    console.log(fileText);
                  }
                });
              });
            }
  
            extractText(1);
          });
        };
        reader.readAsArrayBuffer(selectedFile);
      }
    });
  });
  