import "./message.css"

export default {
    show(msg: string, isGoodNews: boolean=false) {
        const div = document.createElement("div");
        div.className = "message";
        const text = document.createElement("div");
        if( isGoodNews ) {
            text.style.color = "#0f3";
        }
        text.textContent = msg;
        div.appendChild(text);

        document.body.appendChild(div);
        setTimeout(()=> {
            div.classList.add("show");
            setTimeout(() => {
                div.classList.add("hide");
                setTimeout(()=> {
                    document.body.removeChild(div);
                }, 300);
            }, 1300);
        });
    }
}
