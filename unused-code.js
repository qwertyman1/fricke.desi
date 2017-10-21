//Get all images at once ----------

_handleResponseParallel: async function (data) {
    //Sort by date taken desc
    var items = data.items;
    items.sort(imageFetcher._sortImageTakenDesc); //Don't use 'this' in callback

    //Add images for each item
    await Promise.all(items.map(async (item) => {

        //var item = items[i];
        var element = imageCreator.createEmptyElement(item);
        $("#images").appendChild(element);

        var url = "https://www.googleapis.com/drive/v3/files/" + item.id + "?alt=media&key=" + imageFetcher._key;
        var imgData = await (await fetch(url)).blob();
        var imgDataUrl = URL.createObjectURL(imgData);

        document.getElementById(item.id).src = imgDataUrl
    }));

},



//Caching image data

var img = this._createEmptyImage(item.id, 'rot-' + item.imageMediaMetadata.rotation);
if (!this._cacheImgGet(item.id, img)) {
    img.addEventListener('load', () => this._cacheImg(item.id, img));
    img.src = "https://drive.google.com/uc?export=view&id=" + item.id;
}


createEmptyElement: function (item) {
    var img = this._createEmptyImage(item.id, 'rot-' + item.imageMediaMetadata.rotation);

    //Set height relative to viewport 
    var w = item.imageMediaMetadata.width;
    var h = item.imageMediaMetadata.height;
    let newImgHeight;
    if (item.imageMediaMetadata.rotation == 0 || item.imageMediaMetadata.rotation == 2) {
        newImgHeight = Math.floor(h / w * 100);
    }
    else {
        newImgHeight = Math.floor(w / h * 100);
    }

    img.style.minHeight = newImgHeight + "vw";


    var span = document.createElement("span");
    var date = exifHelper.getMoment(item.imageMediaMetadata.date);
    var text = dateFormat.readableTimespamp(date);
    span.innerText = text;

    var el = document.createElement("div");
    el.appendChild(img);
    el.appendChild(span);
    return el;
},



_cacheImg: function (key, img) {
    var imgData = this._getBase64Image(img);
    localStorage.setItem(key, imgData);
},

_cacheImgGet: function (key, img) {
    var dataImage = localStorage.getItem(key);
    if (dataImage) {
        img.src = "data:image/png;base64," + dataImage;
        return true;
    } else {
        return false;
    }
},



_getBase64Image: function (img) {
    var canvas = document.createElement("canvas");
    canvas.width = img.width;
    canvas.height = img.height;

    var ctx = canvas.getContext("2d");
    ctx.drawImage(img, 0, 0);

    var dataURL = canvas.toDataURL("image/png");

    return dataURL.replace(/^data:image\/(png|jpg);base64,/, "");
},
