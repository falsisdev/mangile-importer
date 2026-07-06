(function(){let e=document.createElement(`link`).relList;if(e&&e.supports&&e.supports(`modulepreload`))return;for(let e of document.querySelectorAll(`link[rel="modulepreload"]`))n(e);new MutationObserver(e=>{for(let t of e)if(t.type===`childList`)for(let e of t.addedNodes)e.tagName===`LINK`&&e.rel===`modulepreload`&&n(e)}).observe(document,{childList:!0,subtree:!0});function t(e){let t={};return e.integrity&&(t.integrity=e.integrity),e.referrerPolicy&&(t.referrerPolicy=e.referrerPolicy),e.crossOrigin===`use-credentials`?t.credentials=`include`:e.crossOrigin===`anonymous`?t.credentials=`omit`:t.credentials=`same-origin`,t}function n(e){if(e.ep)return;e.ep=!0;let n=t(e);fetch(e.href,n)}})();var e=[];document.querySelector(`#app`).innerHTML=`
<div class="app">

    <header class="header">

        <div>
            <h1>Mangile Importer</h1>
            <p>Komikku -> Sanity Manga Ice Aktarma Araci</p>
        </div>

        <div id="status" class="status loading">
            Baglanti kontrol ediliyor...
        </div>

    </header>

    <main class="content">

        <section class="card">

            <h2>Manga</h2>

            <p class="description">
                ComicInfo.xml otomatik algilanacaktir. Istersen asagidan farkli
                bir manga secebilirsin.
            </p>

            <select id="mangaSelect">

                <option value="">
                    Otomatik Algila (ComicInfo.xml)
                </option>

            </select>

        </section>

        <section class="card">

            <div class="section-heading">
                <div>
                    <h2>CBZ Dosyalari</h2>
                    <p class="description">
                        Bir veya birden fazla .cbz dosyasi sec veya surukle-birak.
                    </p>
                </div>

                <span id="fileCount" class="file-count">
                    0 dosya
                </span>
            </div>

            <label id="dropZone" class="drop-zone" for="cbzInput">
                <input
                    id="cbzInput"
                    type="file"
                    accept=".cbz,application/vnd.comicbook+zip,application/zip"
                    multiple
                />

                <span class="drop-zone-icon">+</span>
                <span class="drop-zone-title">CBZ dosyalarini buraya birak</span>
                <span class="drop-zone-description">
                    veya dosya secmek icin tikla
                </span>
            </label>

            <div id="emptyFiles" class="empty-files">
                Henuz dosya secilmedi.
            </div>

            <ul id="fileList" class="file-list" aria-label="Secilen CBZ dosyalari"></ul>

            <div class="actions">
                <button id="previewButton" class="primary-action" type="button" disabled>
                    Onizle
                </button>
            </div>

        </section>

    </main>

</div>
`;var t=document.querySelector(`#status`),n=document.querySelector(`#mangaSelect`),r=document.querySelector(`#dropZone`),i=document.querySelector(`#cbzInput`),a=document.querySelector(`#fileList`),o=document.querySelector(`#emptyFiles`),s=document.querySelector(`#fileCount`),c=document.querySelector(`#previewButton`),l=!1;async function u(){try{let e=await fetch(`/api/health`);if(!e.ok)throw Error();let n=await e.json();t.className=`status success`,t.textContent=`OK ${n.projectId} / ${n.dataset}`}catch{t.className=`status error`,t.textContent=`Sanity'e baglanilamadi`}}async function d(){try{let e=await fetch(`/api/mangas`);if(!e.ok)throw Error();(await e.json()).forEach(e=>{let t=document.createElement(`option`);t.value=e._id,t.textContent=e.title,n.appendChild(t)})}catch{let e=document.createElement(`option`);e.disabled=!0,e.textContent=`Mangalar yuklenemedi`,n.appendChild(e)}}function f(e){return`${e.name}-${e.size}-${e.lastModified}`}function p(e){return e.name.toLowerCase().endsWith(`.cbz`)}function m(e){if(e===0)return`0 B`;let t=[`B`,`KB`,`MB`,`GB`],n=Math.min(Math.floor(Math.log(e)/Math.log(1024)),t.length-1),r=e/1024**n;return`${r.toFixed(r>=10||n===0?0:1)} ${t[n]}`}function h(e){return e.pages?.length??0}function g(t){let n=new Set(e.map(e=>e.key));Array.from(t).filter(p).forEach(t=>{let r=f(t);n.has(r)||(e.push({key:r,file:t,status:`idle`}),n.add(r))}),_()}function _(){a.innerHTML=``,s.textContent=e.length===1?`1 dosya`:`${e.length} dosya`,o.hidden=e.length>0,a.hidden=e.length===0,c.disabled=e.length===0||l,c.textContent=l?`Onizleniyor...`:`Onizle`,e.forEach((t,n)=>{let r=document.createElement(`li`),i=document.createElement(`div`),o=document.createElement(`div`),s=document.createElement(`span`),c=document.createElement(`span`),u=document.createElement(`span`),d=document.createElement(`button`);if(r.className=`file-item`,i.className=`file-row`,o.className=`file-info`,s.className=`file-name`,c.className=`file-size`,u.className=`file-status ${t.status}`,d.className=`remove-file`,s.textContent=t.file.name,c.textContent=m(t.file.size),u.textContent=v(t.status),d.type=`button`,d.textContent=`Kaldir`,d.disabled=l,d.setAttribute(`aria-label`,`${t.file.name} dosyasini kaldir`),d.addEventListener(`click`,()=>{e.splice(n,1),_()}),o.append(s,c),i.append(o,u,d),r.appendChild(i),t.status===`success`&&t.chapter&&r.appendChild(y(t.chapter)),t.status===`error`&&t.error){let e=document.createElement(`p`);e.className=`file-error`,e.textContent=t.error,r.appendChild(e)}a.appendChild(r)})}function v(e){switch(e){case`loading`:return`Okunuyor`;case`success`:return`Hazir`;case`error`:return`Hata`;default:return`Bekliyor`}}function y(e){let t=document.createElement(`dl`),n=e.title||`Baslik yok`,r=e.series||`Seri yok`,i=e.number||`Numara yok`,a=h(e);return t.className=`chapter-preview`,t.append(b(`Baslik`,n),b(`Seri`,r),b(`Sayi`,i),b(`Sayfa`,`${a}`)),e.summary&&t.appendChild(b(`Ozet`,e.summary)),t}function b(e,t){let n=document.createElement(`div`),r=document.createElement(`dt`),i=document.createElement(`dd`);return n.className=`preview-item`,r.textContent=e,i.textContent=t,n.append(r,i),n}async function x(e){let t=new FormData;t.append(`cbz`,e.file),n.value&&t.append(`mangaId`,n.value);let r=await fetch(`/api/upload`,{method:`POST`,body:t});if(!r.ok){let e=await r.text();throw Error(e||`CBZ dosyasi okunamadi.`)}return r.json()}async function S(){if(!(e.length===0||l)){l=!0,_();for(let t of e){t.status=`loading`,t.chapter=void 0,t.error=void 0,_();try{t.chapter=await x(t),t.status=`success`}catch(e){t.status=`error`,t.error=e instanceof Error?e.message.trim():`Bilinmeyen bir hata olustu.`}_()}l=!1,_()}}function C(e){e.preventDefault(),e.stopPropagation()}u(),d(),_(),n.addEventListener(`change`,()=>{console.log(`Secilen Manga:`,n.value)}),i.addEventListener(`change`,()=>{i.files&&(g(i.files),i.value=``)}),c.addEventListener(`click`,()=>{S()}),r.addEventListener(`dragenter`,e=>{C(e),r.classList.add(`drag-over`)}),r.addEventListener(`dragover`,e=>{C(e),r.classList.add(`drag-over`)}),r.addEventListener(`dragleave`,e=>{C(e),r.classList.remove(`drag-over`)}),r.addEventListener(`drop`,e=>{C(e),r.classList.remove(`drag-over`),e.dataTransfer?.files&&g(e.dataTransfer.files)});