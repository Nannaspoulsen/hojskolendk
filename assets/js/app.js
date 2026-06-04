document.addEventListener("DOMContentLoaded", function () {
  // Jeg venter med at køre min JavaScript, til HTML-siden er færdig indlæst.
  // Det gør, at mine querySelector-kald kan finde elementerne på siden.
  // Her kalder jeg alle mine init-funktioner, så hver del af sitet bliver sat i gang ét sted.
  initMenuOgNavigation();
  initOplevelseScroll();
  initRejsebreveSliderForside();
  initOpholdMenu();
  initTooltips();
  initDestinationAccordion();
  initInkluderetSlider();
  initFagSlider();
  initRejseinspirationSliders();
  initFooterMenuer();
  initMedarbejdereModal();
  initKontorPrikker();
  initKontaktBilleder();
  initRejsebreveSliderSide();

  /* HJÆLPEFUNKTIONER */

  // Jeg bruger denne funktion til at sætte aktiv class på den rigtige prik.
  // Funktionen bliver genbrugt i flere sliders, så jeg undgår at skrive den samme logik igen og igen.
  function opdaterPrikker(prikker, aktivIndex) {
    prikker.forEach(function (prik, index) {
      // toggle får her en betingelse som andet argument.
      // Classen "aktiv" bliver kun sat på den prik, hvor index matcher aktivIndex.
      prik.classList.toggle("aktiv", index == aktivIndex);
    });
  }

  // Jeg finder det kort, der ligger længst venstre
  function findAktivtKortFraVenstre(spor, kort) {
    let aktivIndex = 0;
    let mindsteAfstand = Infinity;

    kort.forEach(function (enkeltKort, index) {
      // offsetLeft er kortets afstand fra starten af slideren.
      // scrollLeft er hvor langt brugeren allerede har scrollet vandret.
      // Math.abs gør tallet positivt, så jeg kun sammenligner afstand og ikke retning.
      const afstand = Math.abs(enkeltKort.offsetLeft - spor.scrollLeft);

      if (afstand < mindsteAfstand) {
        mindsteAfstand = afstand;
        aktivIndex = index;
      }
    });

    return aktivIndex;
  }

  // Jeg finder det kort, der ligger tættest på midten af slideren.
  function findAktivtKortFraMidten(spor, kort) {
    // getBoundingClientRect() giver elementets placering i browser-vinduet.
    // Jeg finder sliderens midtpunkt ved at tage venstre kant + halvdelen af bredden.
    // KILDE: https://developer.mozilla.org/en-US/docs/Web/API/Element/getBoundingClientRect

    const sporMidte = spor.getBoundingClientRect().left + spor.offsetWidth / 2;

    let aktivIndex = 0;
    let kortesteAfstand = Infinity;

    kort.forEach(function (enkeltKort, index) {
      // Her finder jeg hvert korts midtpunkt og måler afstanden til sliderens midte med samme getBoundingClientRect
      // Det kort med kortest afstand bliver betragtet som det aktive kort.
      const kortMidte = enkeltKort.getBoundingClientRect().left + enkeltKort.offsetWidth / 2;
      const afstand = Math.abs(sporMidte - kortMidte);

      if (afstand < kortesteAfstand) {
        kortesteAfstand = afstand;
        aktivIndex = index;
      }
    });

    return aktivIndex;
  }

  // Jeg scroller til et bestemt kort i en horisontal slider.
  function scrollTilKort(kort, placering) {
    // scrollIntoView bruges til at få browseren til selv at scrolle frem til kortet.
    // Jeg sender placeringen ind som parameter, fordi nogle sliders skal starte ved venstre kant og andre centreres.
    kort.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: placering
    });
  }





/* MENU OG NAVIGATION */

function initMenuOgNavigation() {
  // Denne funktion styrer både burgermenuen og dropdown menuerne i navigationen
  const menuKnap = document.querySelector(".js-menu-knap");
  const navigation = document.querySelector(".js-navigation");
  const dropdownKnapper = document.querySelectorAll(".js-dropdown-knap");

  // Jeg tjekker først, om elementerne findes, så koden ikke fejler på sider uden samme navigation
  if (menuKnap && navigation) {
    menuKnap.addEventListener("click", function () {
      // Jeg toggler class på både knappen, navigationen og body.
      // Body class bruges til at låse siden, så man ikke scroller bag menuen på mobil.
      menuKnap.classList.toggle("er-aaben");
      navigation.classList.toggle("er-aaben");
      document.body.classList.toggle("er-laast");

      const menuErAaben = navigation.classList.contains("er-aaben");

      // aria-expanded og aria-label opdateres, så skærmlæsere også kan se om menuen er åben eller lukket
      menuKnap.setAttribute("aria-expanded", menuErAaben);
      menuKnap.setAttribute("aria-label", menuErAaben ? "Luk menu" : "Åbn menu");
    });
  }

  dropdownKnapper.forEach(function (dropdownKnap) {
    dropdownKnap.addEventListener("click", function () {
      // closest finder det nærmeste overordnede menupunkt, som hører sammen med den knap, man har klikket på
      const dropdownPunkt = dropdownKnap.closest(".navigation-punkt-dropdown");

      if (!dropdownPunkt) {
        return;
      }

      // Før jeg åbner den valgte dropdown, lukker jeg de andre for en roligere navigation, fordi der kun er en dropdown åben af gangen
      dropdownKnapper.forEach(function (andenDropdownKnap) {
        const andetDropdownPunkt = andenDropdownKnap.closest(".navigation-punkt-dropdown");

        if (andetDropdownPunkt && andetDropdownPunkt != dropdownPunkt) {
          andetDropdownPunkt.classList.remove("er-aaben");
          andenDropdownKnap.setAttribute("aria-expanded", "false");
        }
      });

      dropdownPunkt.classList.toggle("er-aaben");

      const dropdownErAaben = dropdownPunkt.classList.contains("er-aaben");

      dropdownKnap.setAttribute("aria-expanded", dropdownErAaben);
    });
  });
}




  /* OPLEVELSE DESKTOP SCROLL PÅ FORSIDE/INDEX */

  /* KILDE: https://freefrontend.com/javascript-horizontal-scroll/#google_vignette 
  
  Har problemer i safari - sektionen scroller for langt efter billederækken er kørt igennem. I Chrome virker det efter hensigten. Kan ikke gennemskue hvordan dette løses */

  function initOplevelseScroll() {
   
    const oplevelseSektion = document.querySelector(".oplevelse-sektion");
    const oplevelseSlider = document.querySelector(".oplevelse-slider, .oplevelse-kort-slider");

    if (!oplevelseSektion || !oplevelseSlider) {
      return;
    }

    function opdaterOplevelseScroll() {
      // Effekten skal kun køre på desktop. På mobil stopper funktionen her
      if (window.innerWidth < 900) {
        return;
      }

      // Her måler jeg sektionens placering og højde, så jeg kan regne ud hvor langt brugeren er inde i sektionen.
      const sektionTop = oplevelseSektion.offsetTop;
      const sektionHoejde = oplevelseSektion.offsetHeight;
      const vindueHoejde = window.innerHeight;

      const scrollStart = sektionTop;
      const scrollSlut = sektionTop + sektionHoejde - vindueHoejde;
      const scrollNu = window.scrollY;

      // fremdrift bliver et tal mellem ca. 0 og 1, hvor 0 er starten af sektionen og 1 er slutningen.
      // Math.max og Math.min låser værdien mellem 0 og 1, så slideren ikke rykker for langt uden for 
      const fremdrift = (scrollNu - scrollStart) / (scrollSlut - scrollStart);
      const begraensetFremdrift = Math.min(Math.max(fremdrift, 0), 1);

      // scrollWidth er hele sliderens bredde også den del man ikke kan se
      // Når jeg trækker vinduets bredde fra, får jeg den maksimale vandrette afstand slideren skal kunne flytte sig.
      const maksRyk = oplevelseSlider.scrollWidth - window.innerWidth;
      // Jeg ganger med -1, fordi slideren skal flytte sig mod venstre, mens brugeren scroller nedad
      const ryk = maksRyk * begraensetFremdrift * -1;

      // Jeg sender værdien over i CSS som en custom property, så selve transform-effekten kan styres i CSS.
      oplevelseSlider.style.setProperty("--oplevelse-rykning", `${ryk}px`);
    }

    // Funktionen køres både ved scroll og resize, fordi det afhænger af vinduets størrelse og scroll-position
    window.addEventListener("scroll", opdaterOplevelseScroll);
    window.addEventListener("resize", opdaterOplevelseScroll);

    opdaterOplevelseScroll();
  }



  /* REJSEBREVE SLIDER PÅ FORSIDE/INDEX */

  function initRejsebreveSliderForside() {
    // Denne slider bruger pile, prikker og scrollLeft
    const slider = document.querySelector("[data-rejsebreve-slider]");
    const forrige = document.querySelector(".rejsebreve-pil-forrige");
    const naeste = document.querySelector(".rejsebreve-pil-naeste");
    const prikker = document.querySelectorAll(".rejsebreve-prik");
    const kort = document.querySelectorAll(".rejsebrev-kort");

    if (!slider || !kort.length) {
      return;
    }

    function findKortBredde() {
      // Jeg bruger det første korts bredde som standard og lægger 16px til for afstanden mellem kortene.
      return kort[0].offsetWidth + 16;
    }

    function opdaterRejsebrevePrikker() {
      // Jeg dividerer den vandrette scroll-position med kortbredden for at finde ud af, hvilket kort brugeren er nået til.
      // Math.round runder til nærmeste hele kort, så prikken følger det kort der er synligt.
      const aktivIndex = Math.round(slider.scrollLeft / findKortBredde());

      opdaterPrikker(prikker, aktivIndex);

      if (forrige) {
         // Hvis vi er på det første kort, bliver tilbagepilen gjort mere gennemsigtig.
         // Ellers vises tilbagepilen som normal
        forrige.style.opacity = aktivIndex == 0 ? "0.35" : "1";
      }
    }

    function scrollTilRejsebrev(index) {
      // scrollTo flytter slideren til en præcis position baseret på kortets index.
      slider.scrollTo({
        left: findKortBredde() * index,
        behavior: "smooth"
      });
    }

    slider.addEventListener("scroll", opdaterRejsebrevePrikker);

    prikker.forEach(function (prik, index) {
      prik.addEventListener("click", function () {
        scrollTilRejsebrev(index);
      });
    });

    if (naeste) {
      naeste.addEventListener("click", function () {
        slider.scrollBy({
          left: findKortBredde(),
          behavior: "smooth"
        });
      });
    }

    if (forrige) {
      forrige.addEventListener("click", function () {
        slider.scrollBy({
          left: -findKortBredde(),
          behavior: "smooth"
        });
      });
    }

    opdaterRejsebrevePrikker();
  }



  /* OPHOLD MENU */

  function initOpholdMenu() {
    // Denne funktion styrer den sticky interne menu på opholdssiden og markerer den sektion som  brugeren er på
    const opholdMenu = document.querySelector(".ophold-menu-indhold");
    const opholdMenuLinks = document.querySelectorAll(".ophold-menu-link");
    const opholdMenuWrapper = document.querySelector(".ophold-menu");

    if (!opholdMenu || !opholdMenuLinks.length || !opholdMenuWrapper) {
      return;
    }

 // Jeg samler alle menulinks i en liste, så jeg kan finde sektionerne
const opholdSektioner = Array.from(opholdMenuLinks)
  .map(function (link) {
    // Linkets href fortæller, hvilken sektion det hører til
    const sektionId = link.getAttribute("href");
    const sektion = document.querySelector(sektionId);

        if (!sektion) {
          return null;
        }

        return {
          link: link,
          sektion: sektion
        };
      })
      .filter(function (punkt) {
        // Jeg fjerner de links, hvor der ikke findes sektion på siden
        return punkt != null;
      });

    if (!opholdSektioner.length) {
      return;
    }

    // Jeg gemmer det aktive link
    let nuvaerendeAktivLink = opholdMenuLinks[0];

    function saetAktivtLink(nytAktivtLink) {
     
      if (nytAktivtLink == nuvaerendeAktivLink) {
        return;
      }

      opholdMenuLinks.forEach(function (link) {
        link.classList.remove("aktiv");
      });

      nytAktivtLink.classList.add("aktiv");
      nuvaerendeAktivLink = nytAktivtLink;

      if (window.innerWidth < 900) {
        nytAktivtLink.scrollIntoView({
          behavior: "smooth",
          inline: "center",
          block: "nearest"
        });
      }
    }

    function opdaterAktivSektion() {
      // Jeg tager højde for menuens egen højde, så en sektion først bliver aktiv, når den reelt er kommet op og bliver vist
      const menuHoejde = opholdMenuWrapper.offsetHeight;
      const aktivtPunkt = menuHoejde + 80;

      let aktivtLink = opholdSektioner[0].link;

      opholdSektioner.forEach(function (punkt) {
        // getBoundingClientRect().top fortæller, hvor langt sektionens top ligger fra toppen af browser-vinduet.
        const sektionTop = punkt.sektion.getBoundingClientRect().top;

        // Når sektionen er nået op til mit aktive punkt, bliver dens link markeret som aktivt.
        if (sektionTop <= aktivtPunkt) {
          aktivtLink = punkt.link;
        }
      });

      saetAktivtLink(aktivtLink);
    }

    opholdMenuLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        saetAktivtLink(link);
      });
    });

    // passive: true fortæller browseren, at scroll-eventet ikke bliver stoppet med preventDefault.
    // gør scroll mere smooth
    window.addEventListener("scroll", opdaterAktivSektion, { passive: true });

    opdaterAktivSektion();
  }



  /* TOOLTIP */

  function initTooltips() {
    // Tooltip-funktionen åbner infoboks og lukker dem igen ved klik udenfor eller Escape
    const tooltipKnapper = document.querySelectorAll(".tooltip-knap");

    tooltipKnapper.forEach(function (knap) {
      knap.addEventListener("click", function (event) {
        // stopPropagation forhindrer klikket på tooltip-knappen i også at ramme document-clicket, som ellers ville lukke tooltippen med det samme.
        // KILDE: https://dev.to/seanwelshbrown/using-stoppropagation-in-to-stop-event-bubbling-in-javascript-2g8d

        event.stopPropagation();

        const tooltip = knap.parentElement.querySelector(".tooltip-boks");

        // Før den valgte tooltip åbnes, lukker jeg alle andre aktive tooltips.
        document.querySelectorAll(".tooltip-boks.aktiv").forEach(function (aktivTooltip) {
          if (aktivTooltip != tooltip) {
            aktivTooltip.classList.remove("aktiv");
          }
        });

        if (tooltip) {
          tooltip.classList.toggle("aktiv");
        }
      });
    });

    // Når man klikker et andet sted på siden, lukkes alle tooltips.
    document.addEventListener("click", lukAlleTooltips);

    document.addEventListener("keydown", function (event) {
      if (event.key == "Escape") {
        lukAlleTooltips();
      }
    });

    function lukAlleTooltips() {
      document.querySelectorAll(".tooltip-boks.aktiv").forEach(function (tooltip) {
        tooltip.classList.remove("aktiv");
      });
    }
  }



 /* DESTINATION ACCORDION */

function initDestinationAccordion() {

  // Finder det destinationskort der skal kunne klikkes åbent/lukket
  const destinationKort = document.querySelector(".destination-kort-aaben");

  if (!destinationKort) {
    return;
  }

  // Finder toppen af kortet som brugeren klikker på
  const destinationKnap = destinationKort.querySelector(".destination-top");

  // Finder symbolet i kortet + eller -
  const destinationSymbol = destinationKort.querySelector(".destination-symbol");

  // Stopper hvis enten knappen eller symbolet mangler
  if (!destinationKnap || !destinationSymbol) {
    return;
  }

  // Når der klikkes på toppen af kortet, skal det skifte mellem åbent og lukket
  destinationKnap.addEventListener("click", function () {


    // åbne/lukke effekten
    destinationKort.classList.toggle("er-lukket");

    // Tjekker om kortet lige nu har classen er-lukket
    if (destinationKort.classList.contains("er-lukket")) {

      // Hvis kortet er lukket, viser jeg plus
      destinationSymbol.textContent = "+";
    } else {

      // Hvis kortet er åbent, viser jeg minus
      destinationSymbol.textContent = "-";
    }
  });
}



  /* INKLUDERET SLIDER */

  function initInkluderetSlider() {
    // opretter selv sine prikker ud fra antallet af kort i HTML.
    const slider = document.querySelector("[data-inkluderet-slider]");

    if (!slider) {
      return;
    }

    const spor = slider.querySelector("[data-inkluderet-spor]");
    // hvis spor findes, finder jeg kortene ellers bruger jeg et tomt array.

    const kort = spor ? Array.from(spor.querySelectorAll(".inkluderet-kort")) : [];
    const prikBoks = slider.querySelector("[data-inkluderet-prikker]");
    const forrige = slider.querySelector("[data-inkluderet-forrige]");
    const naeste = slider.querySelector("[data-inkluderet-naeste]");

    if (!spor || !kort.length || !prikBoks) {
      return;
    }

    // én prik pr kort, så det altid passer til det faktiske antal kort.
    kort.forEach(function (enkeltKort, index) {
      const prik = document.createElement("button");

      prik.className = "inkluderet-prik";
      prik.type = "button";
      prik.setAttribute("aria-label", "Gå til kort " + (index + 1));

      if (index == 0) {
        prik.classList.add("aktiv");
      }

      prik.addEventListener("click", function () {
        scrollTilKort(enkeltKort, "start");
      });

      prikBoks.appendChild(prik);
    });

    const prikker = Array.from(prikBoks.querySelectorAll(".inkluderet-prik"));

    function opdaterInkluderetSlider() {
      const aktivIndex = findAktivtKortFraVenstre(spor, kort);

      opdaterPrikker(prikker, aktivIndex);

      if (forrige) {
        // Tilbageknappen deaktiveres, når slideren næsten står helt i starten.
        forrige.disabled = spor.scrollLeft <= 5;
      }

      if (naeste) {
        // Næste-knappen deaktiveres, når den synlige bredde + scroll-position næsten når hele sliderens bredde.
        naeste.disabled = spor.scrollLeft + spor.clientWidth >= spor.scrollWidth - 5;
      }
    }

    if (forrige) {
      forrige.addEventListener("click", function () {
        const aktivIndex = findAktivtKortFraVenstre(spor, kort);
        // Math.max sikrer, at index aldrig bliver lavere end 0.
        const nytIndex = Math.max(aktivIndex - 1, 0);

        scrollTilKort(kort[nytIndex], "start");
      });
    }

    if (naeste) {
      naeste.addEventListener("click", function () {
        const aktivIndex = findAktivtKortFraVenstre(spor, kort);
        // Math.min sikrer, at index aldrig bliver højere end det sidste kort
        const nytIndex = Math.min(aktivIndex + 1, kort.length - 1);

        scrollTilKort(kort[nytIndex], "start");
      });
    }

    spor.addEventListener("scroll", opdaterInkluderetSlider);
    window.addEventListener("resize", opdaterInkluderetSlider);

    opdaterInkluderetSlider();
  }



  /* FAG SLIDER */

  function initFagSlider() {
    // Fag-slideren minder om inkluderet-slideren, men her vurderes aktivt kort ud fra midten af slideren.
    const slider = document.querySelector("[data-fag-slider]");

    if (!slider) {
      return;
    }

    const spor = slider.querySelector("[data-fag-spor]");
    const kort = spor ? Array.from(spor.querySelectorAll(".fag-kort")) : [];
    const prikBoks = slider.querySelector("[data-fag-prikker]");

    if (!spor || !kort.length || !prikBoks) {
      return;
    }

    kort.forEach(function (enkeltKort, index) {
      const prik = document.createElement("button");

      prik.className = "fag-prik";
      prik.type = "button";

      if (index == 0) {
        prik.classList.add("aktiv");
      }

      prik.addEventListener("click", function () {
        scrollTilKort(enkeltKort, "center");
      });

      prikBoks.appendChild(prik);
    });

    const prikker = Array.from(prikBoks.querySelectorAll(".fag-prik"));

    function opdaterFagPrikker() {
      const aktivIndex = findAktivtKortFraMidten(spor, kort);

      opdaterPrikker(prikker, aktivIndex);
    }

    spor.addEventListener("scroll", opdaterFagPrikker);
    window.addEventListener("resize", opdaterFagPrikker);

    opdaterFagPrikker();
  }



  /* REJSEINSPIRATION SLIDER */

  function initRejseinspirationSliders() {
    const rejseinspirationer = document.querySelectorAll("[data-rejseinspiration]");

    // Jeg gennemgår hver slider separat, så hver slider får sine egne kort, prikker og scroll
    rejseinspirationer.forEach(function (rejseinspiration) {
      const liste = rejseinspiration.querySelector(".rejseinspiration-liste");
      const kort = Array.from(rejseinspiration.querySelectorAll(".rejseinspiration-kort"));
      const prikBoks = rejseinspiration.querySelector(".rejseinspiration-prikker");

      if (!liste || !kort.length || !prikBoks) {
        return;
      }

      kort.forEach(function (enkeltKort, index) {
        const prik = document.createElement("button");

        prik.type = "button";

        if (index == 0) {
          prik.classList.add("aktiv");
        }

        prik.addEventListener("click", function () {
          scrollTilKort(enkeltKort, "center");
        });

        prikBoks.appendChild(prik);
      });

      const prikker = Array.from(prikBoks.querySelectorAll("button"));

      function opdaterRejseinspirationPrikker() {
        const aktivIndex = findAktivtKortFraMidten(liste, kort);

        opdaterPrikker(prikker, aktivIndex);
      }

      liste.addEventListener("scroll", opdaterRejseinspirationPrikker);
      window.addEventListener("resize", opdaterRejseinspirationPrikker);

      opdaterRejseinspirationPrikker();
    });
  }



/* FOOTER */

function initFooterMenuer() {

  // Finder alle footer-menuer der har data-footer-menu på sig
  const footerMenuer = document.querySelectorAll("[data-footer-menu]");

  // tjekker jeg om skærmen er mindst 900px bred
  const desktopFooter = window.matchMedia("(min-width: 900px)");

  // Hvis der ikke findes nogen footer-menuer på siden, stopper funktionen
  if (!footerMenuer.length) {
    return;
  }

  function opdaterFooterMenuer() {
    footerMenuer.forEach(function (menu) {

      // På desktop skal footer-menuerne være åbne - på mobil skal de være lukkede
      menu.open = desktopFooter.matches;
    });
  }

  // Kører funktionen med det samme, så footer-menuerne får den rigtige tilstand når siden loader
  opdaterFooterMenuer();

  // Holder øje med om skærmen skifter mellem mobil og desktop
  // Hvis den går over eller under 900px, kører funktionen igen
  desktopFooter.addEventListener("change", opdaterFooterMenuer);
}





/* MEDARBEJDERE MODAL PÅ LAER OS AT KENDE SIDEN */

function initMedarbejdereModal() {

  // Her ligger ekstra info om medarbejderne
  // Kortet i HTML har data-person fx "emil"
  // Det navn bruger jeg til at finde den rigtige tekst, telefon og mail herinde
  const personer = {
    emil: {
      telefon: "7027 9007",
      mail: "ets@hojskolendk.dk",
      tekst: [
        "Emil er vores direktør og sørger for at vi leverer det fantastiske højskole-eventyr vi lover vores elever. Han er medejer og har desuden rejst med vores elever som både rejseleder og underviser. Rejselivet blev i 2019 skiftet ud med kontoret i Aarhus, hvor han nu bl.a. sidder med strategi, økonomi, ophold og daglig ledelse."
      ]
    }
  };

  // Finder selve modalen
  const kontorModal = document.querySelector("[data-kontor-modal]");

  if (!kontorModal) {
    return;
  }

  // Finder alle de steder i modalen hvor indholdet skal sættes ind
  const modalTitel = document.querySelector("[data-kontor-modal-titel]");
  const modalTekst = document.querySelector("[data-kontor-modal-tekst]");
  const modalBillede = document.querySelector("[data-kontor-modal-billede]");
  const modalNavn = document.querySelector("[data-kontor-modal-navn]");
  const modalRolle = document.querySelector("[data-kontor-modal-rolle]");
  const modalTelefon = document.querySelector("[data-kontor-modal-telefon]");
  const modalTelefonLink = document.querySelector("[data-kontor-modal-telefon-link]");
  const modalMail = document.querySelector("[data-kontor-modal-mail]");
  const modalMailLink = document.querySelector("[data-kontor-modal-mail-link]");

  function aabnModal(kort) {

    // Finder hvilken person der blev klikket på fra data-person i HTML
    const personId = kort.dataset.person;

    // Bruger personId til at hente den rigtige person fra objektet
    // Hvis der ikke findes en person, bruger den bare et tomt objekt
    const person = personer[personId] || {};

    // Henter billede, navn og rolle direkte fra det kort der blev klikket på
    const billede = kort.querySelector(".kontor-billede");
    const navn = kort.querySelector(".kontor-navn").textContent;
    const rolle = kort.querySelector(".kontor-rolle").textContent;

    // Hvis der ikke er skrevet en tekst til personen endnu vises en midlertidig tekst, så modalen stadig virker
    const tekster = person.tekst || [`Kort tekst om ${navn} er endnu ikke udfyldt`];

    // Sætter titel, navn og rolle ind i modalen
    modalTitel.textContent = `Om ${navn.split(" ")[0]}`;
    modalNavn.textContent = navn;
    modalRolle.textContent = rolle;

    // Bruger samme billede i modalen som på kortet
    modalBillede.src = billede.src;
    modalBillede.alt = navn;

    // Tømmer teksten først ellers kan gammel tekst fra en anden medarbejder blive hængende
    modalTekst.innerHTML = "";

    // Laver et p-tag for hvert tekstafsnit. Så kan der være flere afsnit i modalen, hvis jeg får brug for det
    tekster.forEach(function (tekst) {
      const afsnit = document.createElement("p");

      afsnit.textContent = tekst;
      modalTekst.appendChild(afsnit);
    });

    // Skjuler telefon/mail hvis personen ikke har det
    modalTelefonLink.hidden = !person.telefon;
    modalMailLink.hidden = !person.mail;

    // Sætter telefon og mail ind - hvis de ikke findes, bliver feltet bare tomt
    modalTelefon.textContent = person.telefon || "";
    modalMail.textContent = person.mail || "";

    // Gør telefonnummeret klikbart. Mellemrum fjernes, fordi tel-linket helst skal være rent nummer
    modalTelefonLink.href = person.telefon ? `tel:${person.telefon.replaceAll(" ", "")}` : "#";

    // Gør mailen klikbar
    modalMailLink.href = person.mail ? `mailto:${person.mail}` : "#";

    // Viser modalen. Body-classen kan bruges i CSS til fx at låse siden bagved ligesom ved dropdowns
    kontorModal.classList.add("er-synlig");
    document.body.classList.add("modal-er-aaben");
  }

  function lukModal() {

    // Fjerner class der viser modalen
    kontorModal.classList.remove("er-synlig");
    document.body.classList.remove("modal-er-aaben");
  }

  // Finder alle medarbejderkort. Når man klikker på et kort åbner modalen med info fra lige netop det kort
  document.querySelectorAll(".kontor-kort").forEach(function (kort) {
    kort.addEventListener("click", function () {
      aabnModal(kort);
    });
  });

  // Finder alle luk-knapper i modalen, får samme funktion: lukModal
  document.querySelectorAll("[data-kontor-luk]").forEach(function (knap) {
    knap.addEventListener("click", lukModal);
  });

  // Gør det også muligt at lukke modalen med Escape
  document.addEventListener("keydown", function (event) {
    if (event.key == "Escape") {
      lukModal();
    }
  });
}



  /* PRIKKER TIL MEDARBEJDER-SLIDERS */

  function initKontorPrikker() {
    // prikker til medarbejder-sliders, så prikkerne passer til antallet af medarbejderkort.
    document.querySelectorAll("[data-kontor-liste]").forEach(function (liste) {
      const kort = Array.from(liste.querySelectorAll(".kontor-kort"));
      // closest finder den slider-wrapper, som den aktuelle liste ligger i
      const slider = liste.closest(".kontor-slider");

      if (!slider || !kort.length) {
        return;
      }

      const prikkeBoks = slider.querySelector("[data-kontor-prikker]");

      if (!prikkeBoks) {
        return;
      }

      // Jeg tømmer prikkeboksen først, så der ikke bliver lavet dobbelt hvis funktionen køres igen.
      prikkeBoks.innerHTML = "";

      kort.forEach(function (enkeltKort, index) {
        const prik = document.createElement("button");

        prik.className = "kontor-prik";
        prik.type = "button";
        prik.setAttribute("aria-label", `Vis medarbejder ${index + 1}`);

        prik.addEventListener("click", function () {
          scrollTilKort(enkeltKort, "start");
        });

        prikkeBoks.appendChild(prik);
      });

      const prikker = Array.from(prikkeBoks.querySelectorAll(".kontor-prik"));

      function opdaterKontorPrikker() {
        // Jeg beregner aktivt kort ved at dele scroll-positionen med bredden på det første kort.
        const aktivIndex = Math.round(liste.scrollLeft / kort[0].offsetWidth);

        opdaterPrikker(prikker, aktivIndex);
      }

      liste.addEventListener("scroll", opdaterKontorPrikker);

      opdaterKontorPrikker();
    });
  }



  /* BILLEDSKIFT PÅ KONTAKT SIDEN */

  function initKontaktBilleder() {
    // skifter mellem kontaktbilleder ved at toggle en class med et fast interval.
    const kontaktBilleder = document.querySelector(".kontakt-billeder");

    if (!kontaktBilleder) {
      return;
    }

   // Kører funktion igen hver 3,5 sekund
  setInterval(function () {

    // Skifter classen er-bytte til og fra
    // CSS bestemmer så hvilket billede der vises, hvordan billederne bytter
    kontaktBilleder.classList.toggle("er-bytte");
  }, 3500);
}



/* REJSEBREVE SLIDER PÅ REJSEBREVE-SIDEN */

function initRejsebreveSliderSide() {

  // Finder selve listen med rejsebreve-kortene
  const liste = document.querySelector(".rejsebreve-liste");

  // Finder alle rejsebrev-kort og laver dem om til array
  const kort = Array.from(document.querySelectorAll(".rejsebrev-kort"));

  // Finder boksen hvor prikkerne skal sættes ind
  const prikBoks = document.querySelector(".rejsebreve-prikker");

  if (!liste || !kort.length || !prikBoks) {
    return;
  }

  // Går igennem hvert rejsebrev-kort og laver én prik til hvert kort
  kort.forEach(function (enkeltKort, index) {
    const prik = document.createElement("button");

    // Giver prikken class, type og aria-label til skærmlæsere
    prik.className = "rejsebreve-prik";
    prik.type = "button";
    prik.setAttribute("aria-label", "Gå til rejsebrev " + (index + 1));

    // Den første prik skal være aktiv fra start
    if (index == 0) {
      prik.classList.add("aktiv");
    }

    // Når man klikker på en prik scroller slideren hen til det kort der passer til prikken
    prik.addEventListener("click", function () {
      scrollTilKort(enkeltKort, "start");
    });

    // Sætter prikken ind i prik-boksen
    prikBoks.appendChild(prik);
  });

  // Finder alle prikkerne efter de er blevet lavet
  const prikker = Array.from(prikBoks.querySelectorAll(".rejsebreve-prik"));

  function opdaterRejsebrevePrikker() {

    // Finder hvilket kort der er længst til venstre i slideren
    const aktivIndex = findAktivtKortFraVenstre(liste, kort);

    // Opdaterer prikkerne så den rigtige prik får classen aktiv
    opdaterPrikker(prikker, aktivIndex);
  }

  // Når brugeren scroller i slideren skal den aktive prik opdateres
  liste.addEventListener("scroll", opdaterRejsebrevePrikker);

  // Når skærmen ændrer størrelse, kan placeringen ændre sig derfor opdateres prikkerne også ved resize
  window.addEventListener("resize", opdaterRejsebrevePrikker);

  // Kører én gang fra start, så prikkerne passer med det kort man starter på
  opdaterRejsebrevePrikker();
}

});