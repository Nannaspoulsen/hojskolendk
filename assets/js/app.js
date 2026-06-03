document.addEventListener("DOMContentLoaded", function () {
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
  function opdaterPrikker(prikker, aktivIndex) {
    prikker.forEach(function (prik, index) {
      prik.classList.toggle("aktiv", index == aktivIndex);
    });
  }

  // Jeg finder det kort, der ligger tættest på venstre side af slideren.
  function findAktivtKortFraVenstre(spor, kort) {
    let aktivIndex = 0;
    let mindsteAfstand = Infinity;

    kort.forEach(function (enkeltKort, index) {
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
    const sporMidte = spor.getBoundingClientRect().left + spor.offsetWidth / 2;

    let aktivIndex = 0;
    let kortesteAfstand = Infinity;

    kort.forEach(function (enkeltKort, index) {
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
    kort.scrollIntoView({
      behavior: "smooth",
      block: "nearest",
      inline: placering
    });
  }



  /* MENU OG NAVIGATION */

/* MENU OG NAVIGATION */

function initMenuOgNavigation() {
  const menuKnap = document.querySelector(".js-menu-knap");
  const navigation = document.querySelector(".js-navigation");
  const dropdownKnapper = document.querySelectorAll(".js-dropdown-knap");

  if (menuKnap && navigation) {
    menuKnap.addEventListener("click", function () {
      menuKnap.classList.toggle("er-aaben");
      navigation.classList.toggle("er-aaben");
      document.body.classList.toggle("er-laast");

      const menuErAaben = navigation.classList.contains("er-aaben");

      menuKnap.setAttribute("aria-expanded", menuErAaben);
      menuKnap.setAttribute("aria-label", menuErAaben ? "Luk menu" : "Åbn menu");
    });
  }

  dropdownKnapper.forEach(function (dropdownKnap) {
    dropdownKnap.addEventListener("click", function () {
      const dropdownPunkt = dropdownKnap.closest(".navigation-punkt-dropdown");

      if (!dropdownPunkt) {
        return;
      }

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

  function initOplevelseScroll() {
    const oplevelseSektion = document.querySelector(".oplevelse-sektion");
    const oplevelseSlider = document.querySelector(".oplevelse-slider, .oplevelse-kort-slider");

    if (!oplevelseSektion || !oplevelseSlider) {
      return;
    }

    function opdaterOplevelseScroll() {
      if (window.innerWidth < 900) {
        return;
      }

      const sektionTop = oplevelseSektion.offsetTop;
      const sektionHoejde = oplevelseSektion.offsetHeight;
      const vindueHoejde = window.innerHeight;

      const scrollStart = sektionTop;
      const scrollSlut = sektionTop + sektionHoejde - vindueHoejde;
      const scrollNu = window.scrollY;

      const fremdrift = (scrollNu - scrollStart) / (scrollSlut - scrollStart);
      const begraensetFremdrift = Math.min(Math.max(fremdrift, 0), 1);

      const maksRyk = oplevelseSlider.scrollWidth - window.innerWidth;
      const ryk = maksRyk * begraensetFremdrift * -1;

      oplevelseSlider.style.setProperty("--oplevelse-rykning", `${ryk}px`);
    }

    window.addEventListener("scroll", opdaterOplevelseScroll);
    window.addEventListener("resize", opdaterOplevelseScroll);

    opdaterOplevelseScroll();
  }



  /* REJSEBREVE SLIDER PÅ FORSIDE/INDEX */

  function initRejsebreveSliderForside() {
    const slider = document.querySelector("[data-rejsebreve-slider]");
    const forrige = document.querySelector(".rejsebreve-pil-forrige");
    const naeste = document.querySelector(".rejsebreve-pil-naeste");
    const prikker = document.querySelectorAll(".rejsebreve-prik");
    const kort = document.querySelectorAll(".rejsebrev-kort");

    if (!slider || !kort.length) {
      return;
    }

    function findKortBredde() {
      return kort[0].offsetWidth + 16;
    }

    function opdaterRejsebrevePrikker() {
      const aktivIndex = Math.round(slider.scrollLeft / findKortBredde());

      opdaterPrikker(prikker, aktivIndex);

      if (forrige) {
        forrige.style.opacity = aktivIndex == 0 ? "0.35" : "1";
      }
    }

    function scrollTilRejsebrev(index) {
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
    const opholdMenu = document.querySelector(".ophold-menu-indhold");
    const opholdMenuLinks = document.querySelectorAll(".ophold-menu-link");
    const opholdMenuWrapper = document.querySelector(".ophold-menu");

    if (!opholdMenu || !opholdMenuLinks.length || !opholdMenuWrapper) {
      return;
    }

    const opholdSektioner = Array.from(opholdMenuLinks)
      .map(function (link) {
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
        return punkt != null;
      });

    if (!opholdSektioner.length) {
      return;
    }

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
      const menuHoejde = opholdMenuWrapper.offsetHeight;
      const aktivtPunkt = menuHoejde + 80;

      let aktivtLink = opholdSektioner[0].link;

      opholdSektioner.forEach(function (punkt) {
        const sektionTop = punkt.sektion.getBoundingClientRect().top;

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

    window.addEventListener("scroll", opdaterAktivSektion, { passive: true });

    opdaterAktivSektion();
  }



  /* TOOLTIP */

  function initTooltips() {
    const tooltipKnapper = document.querySelectorAll(".tooltip-knap");

    tooltipKnapper.forEach(function (knap) {
      knap.addEventListener("click", function (event) {
        event.stopPropagation();

        const tooltip = knap.parentElement.querySelector(".tooltip-boks");

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
    const destinationKort = document.querySelector(".destination-kort-aaben");

    if (!destinationKort) {
      return;
    }

    const destinationKnap = destinationKort.querySelector(".destination-top");
    const destinationSymbol = destinationKort.querySelector(".destination-symbol");

    if (!destinationKnap || !destinationSymbol) {
      return;
    }

    destinationKnap.addEventListener("click", function () {
      destinationKort.classList.toggle("er-lukket");

      if (destinationKort.classList.contains("er-lukket")) {
        destinationSymbol.textContent = "+";
      } else {
        destinationSymbol.textContent = "-";
      }
    });
  }



  /* INKLUDERET SLIDER */

  function initInkluderetSlider() {
    const slider = document.querySelector("[data-inkluderet-slider]");

    if (!slider) {
      return;
    }

    const spor = slider.querySelector("[data-inkluderet-spor]");
    const kort = spor ? Array.from(spor.querySelectorAll(".inkluderet-kort")) : [];
    const prikBoks = slider.querySelector("[data-inkluderet-prikker]");
    const forrige = slider.querySelector("[data-inkluderet-forrige]");
    const naeste = slider.querySelector("[data-inkluderet-naeste]");

    if (!spor || !kort.length || !prikBoks) {
      return;
    }

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
        forrige.disabled = spor.scrollLeft <= 5;
      }

      if (naeste) {
        naeste.disabled = spor.scrollLeft + spor.clientWidth >= spor.scrollWidth - 5;
      }
    }

    if (forrige) {
      forrige.addEventListener("click", function () {
        const aktivIndex = findAktivtKortFraVenstre(spor, kort);
        const nytIndex = Math.max(aktivIndex - 1, 0);

        scrollTilKort(kort[nytIndex], "start");
      });
    }

    if (naeste) {
      naeste.addEventListener("click", function () {
        const aktivIndex = findAktivtKortFraVenstre(spor, kort);
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
    const footerMenuer = document.querySelectorAll("[data-footer-menu]");
    const desktopFooter = window.matchMedia("(min-width: 900px)");

    if (!footerMenuer.length) {
      return;
    }

    function opdaterFooterMenuer() {
      footerMenuer.forEach(function (menu) {
        menu.open = desktopFooter.matches;
      });
    }

    opdaterFooterMenuer();

    desktopFooter.addEventListener("change", opdaterFooterMenuer);
  }



  /* MEDARBEJDERE MODAL PÅ LAER OS AT KENDE SIDEN */

  function initMedarbejdereModal() {
    const personer = {
      emil: {
        telefon: "7027 9007",
        mail: "ets@hojskolendk.dk",
        tekst: [
          "Emil er vores direktør og sørger for at vi leverer det fantastiske højskole-eventyr vi lover vores elever. Han er medejer og har desuden rejst med vores elever som både rejseleder og underviser. Rejselivet blev i 2019 skiftet ud med kontoret i Aarhus, hvor han nu bl.a. sidder med strategi, økonomi, ophold og daglig ledelse."
        ]
      }
    };

    const kontorModal = document.querySelector("[data-kontor-modal]");

    if (!kontorModal) {
      return;
    }

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
      const personId = kort.dataset.person;
      const person = personer[personId] || {};

      const billede = kort.querySelector(".kontor-billede");
      const navn = kort.querySelector(".kontor-navn").textContent;
      const rolle = kort.querySelector(".kontor-rolle").textContent;
      const tekster = person.tekst || [`Kort tekst om ${navn} er endnu ikke udfyldt`];

      modalTitel.textContent = `Om ${navn.split(" ")[0]}`;
      modalNavn.textContent = navn;
      modalRolle.textContent = rolle;

      modalBillede.src = billede.src;
      modalBillede.alt = navn;

      modalTekst.innerHTML = "";

      tekster.forEach(function (tekst) {
        const afsnit = document.createElement("p");

        afsnit.textContent = tekst;
        modalTekst.appendChild(afsnit);
      });

      modalTelefonLink.hidden = !person.telefon;
      modalMailLink.hidden = !person.mail;

      modalTelefon.textContent = person.telefon || "";
      modalMail.textContent = person.mail || "";

      modalTelefonLink.href = person.telefon ? `tel:${person.telefon.replaceAll(" ", "")}` : "#";
      modalMailLink.href = person.mail ? `mailto:${person.mail}` : "#";

      kontorModal.classList.add("er-synlig");
      document.body.classList.add("modal-er-aaben");
    }

    function lukModal() {
      kontorModal.classList.remove("er-synlig");
      document.body.classList.remove("modal-er-aaben");
    }

    document.querySelectorAll(".kontor-kort").forEach(function (kort) {
      kort.addEventListener("click", function () {
        aabnModal(kort);
      });
    });

    document.querySelectorAll("[data-kontor-luk]").forEach(function (knap) {
      knap.addEventListener("click", lukModal);
    });

    document.addEventListener("keydown", function (event) {
      if (event.key == "Escape") {
        lukModal();
      }
    });
  }



  /* PRIKKER TIL MEDARBEJDER-SLIDERS */

  function initKontorPrikker() {
    document.querySelectorAll("[data-kontor-liste]").forEach(function (liste) {
      const kort = Array.from(liste.querySelectorAll(".kontor-kort"));
      const slider = liste.closest(".kontor-slider");

      if (!slider || !kort.length) {
        return;
      }

      const prikkeBoks = slider.querySelector("[data-kontor-prikker]");

      if (!prikkeBoks) {
        return;
      }

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
        const aktivIndex = Math.round(liste.scrollLeft / kort[0].offsetWidth);

        opdaterPrikker(prikker, aktivIndex);
      }

      liste.addEventListener("scroll", opdaterKontorPrikker);

      opdaterKontorPrikker();
    });
  }



  /* BILLEDSKIFT PÅ KONTAKT SIDEN */

  function initKontaktBilleder() {
    const kontaktBilleder = document.querySelector(".kontakt-billeder");

    if (!kontaktBilleder) {
      return;
    }

    setInterval(function () {
      kontaktBilleder.classList.toggle("er-bytte");
    }, 3500);
  }



  /* REJSEBREVE SLIDER PÅ REJSEBREVE-SIDEN */

  function initRejsebreveSliderSide() {
    const liste = document.querySelector(".rejsebreve-liste");
    const kort = Array.from(document.querySelectorAll(".rejsebrev-kort"));
    const prikBoks = document.querySelector(".rejsebreve-prikker");

    if (!liste || !kort.length || !prikBoks) {
      return;
    }

    kort.forEach(function (enkeltKort, index) {
      const prik = document.createElement("button");

      prik.className = "rejsebreve-prik";
      prik.type = "button";
      prik.setAttribute("aria-label", "Gå til rejsebrev " + (index + 1));

      if (index == 0) {
        prik.classList.add("aktiv");
      }

      prik.addEventListener("click", function () {
        scrollTilKort(enkeltKort, "start");
      });

      prikBoks.appendChild(prik);
    });

    const prikker = Array.from(prikBoks.querySelectorAll(".rejsebreve-prik"));

    function opdaterRejsebrevePrikker() {
      const aktivIndex = findAktivtKortFraVenstre(liste, kort);

      opdaterPrikker(prikker, aktivIndex);
    }

    liste.addEventListener("scroll", opdaterRejsebrevePrikker);
    window.addEventListener("resize", opdaterRejsebrevePrikker);

    opdaterRejsebrevePrikker();
  }
});