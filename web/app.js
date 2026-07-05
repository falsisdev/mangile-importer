const uploadButton = document.getElementById("upload");
const fileInput = document.getElementById("cbz");
const output = document.getElementById("output");

uploadButton.onclick = async () => {

    if (!fileInput.files.length) {
        alert("CBZ seç.");
        return;
    }

    const form = new FormData();

    form.append("cbz", fileInput.files[0]);

    const response = await fetch("/api/upload", {
        method: "POST",
        body: form
    });

    const json = await response.json();

    output.textContent = JSON.stringify(json, null, 2);

};