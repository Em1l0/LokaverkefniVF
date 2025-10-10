# LokaverkefniVF

## Höfundur
**Nafn:** Emil Óli B.
**Áfangi:** FORR3FV05EU 
**Skóli:** Tækniskólinn

---

## Verkefnalýsing
- Mobile 2x2x2 Rubik's cube leikur.
Upphaflega stefndi ég að því að búa til hefðbundinn 3x3x3 Rubik's cube, en eftir nánari hugsun ákvað ég að byrja frekar á einfaldari 2x2x2 útgáfu til að prófa hugmyndina og sjá hversu langt ég kæmist. Markmiðið var að hanna snertistýrðan Rubik's cube þar sem notandinn gæti skoðað allar hliðar á frjálsan hátt. Hins vegar komu upp ýmsar tæknilegar áskoranir, og því ákvað ég að einfalda verkefnið með því að takmarka snúninga við 90 gráður.

Teningurinn styður swipe hreyfingar í allar áttir fyrir venjulegan 2x2x rubik's, og snúningarnir eru útfærðir með hjálp anime.js. Að lokum vildi ég bæta við tveimur hnöppum: „random rotation“ hnapp sem framkvæmir handahófskennda snúninga, og hins vegar „hjálparhnapp“(hafði ekki tíma fyrir mikla stærðfræði) sem gefur vísbendingar um hvernig hægt sé að leysa teninginn. 

---

## Notkun
Hægt er að nota swipe hreyfingar upp, niður, til hægri og vinstri utan við Rubik's teninginn til að snúa honum og skoða aðrar hliðar. Einnig er hægt að nota swipe hreyfingar yfir tvo teninga á hverri hlið til að framkvæma snúninga á þeim. Á hægri og vinstri hlið er hægt að swipe-a upp og niður, en á efri og neðri hliðum er hægt að swipe-a til hægri og vinstri.

Að auki er til „random rotation“ hnappur sem snýr teningnum handahófskennt um 15–30 hliðar. Þetta hjálpar til við að búa til óreglulega uppsetningu sem notandinn getur reynt að leysa.


---


## Myndir og myndbönd
<img width="737" height="601" alt="image" src="https://github.com/user-attachments/assets/3202ec20-6b3e-4e15-8cc0-69e195decde2" />


https://github.com/user-attachments/assets/a0fb4f69-c878-4767-8e85-db0a8f7a3c61










## Heimildir
Kóði frá gömlum verkefnum.

- **Vefslóð 1:** [Sketchfab – 3D Models](https://sketchfab.com/search?type=models)
- **Vefslóð 2:** [Three.js – Object3D.remove](https://threejs.org/docs/#api/en/core/Object3D.remove)
- **Vefslóð 3:** [MDN – Pointer Events](https://developer.mozilla.org/en-US/docs/Web/API/Pointer_events/Using_Pointer_Events)
- **Vefslóð 4:** [Anime.js – Animation Library](https://animejs.com)
- **Vefslóð 5:** [Borstch – Touch Events Guide](https://borstch.com/blog/javascript-touch-events-and-mobile-specific-considerations)
- **Myndband:** [YouTube – Rubik's Tutorial](https://www.youtube.com/watch?v=9PGfL4t-uqE)



---

## Útkoma og niðurstöður

### Hvernig til tókst

Í upphafi var frekar auðvelt að setja upp Rubik's teninginn. Það tókst vel að lita hann og gefa honum grunnvirkni. Ég byrjaði á að nota lyklaborðshreyfingar (keyboard events) til að framkvæma snúninga, og bætti síðan við hreyfingum (animation). Þó að þær hafi ekki virkað fullkomlega sem fyrst, þá skiluðu þær sæmilegri virkni.

Snúningarnir voru ekki alveg réttir í byrjun, og það komu upp vandamál við að hópa fjóra teninga saman og færa þá rétt. Ýmislegt fór úrskeiðis, en smám saman fór allt að smella saman. Þegar ég hafði náð góðri grunnvirkni, fór ég að vinna í því að skipta út lyklaborðshreyfingum fyrir snertistýringar (pointer events).

Upphaflega notaði ég „orbit controls“, en þau reyndust illa samhæf við snertistýringar, svo ég ákvað að fjarlægja þau. Mestur tími fór í að vinna með pointer events, og það komu stöðugt upp villur sem þurfti að leysa. Að lokum fann ég lausn: ég setti upp snertibox á skjáinn, bæði fyrir teninginn sjálfan og svæðið í kringum hann, til að auðvelda snúninga og samskipti.

Þetta heppnaðist frekar vel. Eftir það var verkefnið að setja saman restina af virkni, tryggja að allar swipe-hreyfingar virkuðu rétt. Þó að margar villur hafi komið upp í því ferli, þá fækkaði þeim hratt og kerfið varð stöðugt.




### Næstu skref

Næstu skref gætu verið:

- Að uppfæra teninginn í 3x3x3 útgáfu.
- Að bæta við hjálparhnappi sem leiðbeinir notandanum í gegnum lausnina.
- Að útfæra viðbrögð þegar teningurinn er leystur, t.d. með stuttri hreyfimynd, skilaboðum og auknu sjónrænu umhverfi.
- Að bæta við fleiri bakgrunnsþáttum.
- Að samhæfa orbit controls og pointer events þannig að þau virki saman á hnökralausan hátt.



---
