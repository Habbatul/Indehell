//====== potong tinggi element ======
function adjustElementHeight() {
    const productList = document.getElementById("product-list-container");
    const footer = document.querySelector("footer");
    const textScene1 = document.getElementById("text-scene-1");
    const textScene2 = document.getElementById("text-scene-2");

    if (productList && footer) {
        const footerHeight = footer.offsetHeight;
        productList.style.height = `calc(100dvh - ${footerHeight + 53.7}px)`;
    }

    //hilangkan min-hscreen di html
    if (textScene1 && footer) {
        const footerHeight = footer.offsetHeight;
        textScene1.style.height = `calc(100dvh - ${footerHeight + 51}px)`;
    }
    if (textScene2 && footer) {
        const footerHeight = footer.offsetHeight;
        textScene2.style.height = `calc(100dvh - ${footerHeight + 51}px)`;
    }
}

window.addEventListener("DOMContentLoaded", adjustElementHeight);
window.addEventListener("resize", adjustElementHeight);


//==== hamburger menu ======
document.getElementById("hamburger").addEventListener("click", function (event) {
    document.getElementById("menu").classList.remove("hidden");
});

document.getElementById("close").addEventListener("click", function (event) {
    document.getElementById("menu").classList.add("hidden");
});


//===== fetch data ke card ======
document.addEventListener("DOMContentLoaded", async function () {
    try {
        const response = await fetch("/product/json/product.json");
        const data = await response.json();

        const firstCard = document.querySelector(".product-container");

        if (data.produk && Array.isArray(data.produk) && data.produk.length > 0) {
            const firstProduct = data.produk[0];

            if (firstCard) {
                firstCard.querySelector("img").src = firstProduct.image;
                firstCard.querySelector("img").alt = firstProduct.title;
                firstCard.querySelector("h1").textContent = firstProduct.title;
                firstCard.querySelector("p").textContent = firstProduct.description;
                if (!firstProduct.instagramLink || firstProduct.instagramLink === "-") firstCard.querySelector("a.link-instagram").remove();
                else firstCard.querySelector("a.link-instagram").href = firstProduct.instagramLink;
                if (!firstProduct.shopeeLink || firstProduct.shopeeLink === "-") firstCard.querySelector("a.link-shopee").remove();
                else firstCard.querySelector("a.link-shopee").href = firstProduct.shopeeLink;
            }

            if (data.produk.length > 1) {
                const productContainer = firstCard.parentElement; 

                for (let i = 1; i < data.produk.length; i++) {
                    const product = data.produk[i];

                    const newCard = firstCard.cloneNode(true);
                    newCard.querySelector("img").src = product.image;
                    newCard.querySelector("img").alt = product.title;
                    newCard.querySelector("h1").textContent = product.title;
                    newCard.querySelector("p").textContent = product.description;

                    if (!product.instagramLink || product.instagramLink === "-") newCard.querySelector("a.link-instagram").remove();
                    else newCard.querySelector("a.link-instagram").href = product.instagramLink;
                    if (!product.shopeeLink || product.shopeeLink === "-") newCard.querySelector("a.link-shopee").remove();
                    else newCard.querySelector("a.link-shopee").href = product.shopeeLink;
                        
                    productContainer.appendChild(newCard);
                }
            }
        } else {
            console.error("error");
        }
    } catch (error) {
        console.error("error", error);
    }
});
