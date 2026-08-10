const revealElements = document.querySelectorAll(".reveal");
const heartContainer = document.querySelector("#floating-hearts");
const scrollButtons = document.querySelectorAll("[data-scroll-target]");
const surpriseButton = document.querySelector("[data-surprise-trigger]");
const giftBoxScene = document.querySelector("#gift-box-scene");
const giftBox = document.querySelector("#gift-box");
const giftBoxBalloons = document.querySelector("#gift-box-balloons");
const birthdayMusic = document.querySelector("#birthday-music");
const typedLetterElements = document.querySelectorAll(".typed-letter");
const footerButton = document.querySelector(".footer-button");
const footer = document.querySelector(".footer");
const blooperGallery = document.querySelector("#blooper-gallery");
const blooperNextButtons = document.querySelectorAll(".blooper-next-button");
const blooperPrevButtons = document.querySelectorAll(".blooper-prev-button");

const revealObserver = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (!entry.isIntersecting) {
      return;
    }

    entry.target.classList.add("visible");
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.05 });

revealElements.forEach((element) => revealObserver.observe(element));

scrollButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const targetSelector = button.getAttribute("data-scroll-target");
    const target = targetSelector ? document.querySelector(targetSelector) : null;

    target?.scrollIntoView({ behavior: "smooth", block: "start" });
  });
});

surpriseButton?.addEventListener("click", () => {
  launchGiftSurprise();
});

footerButton?.addEventListener("click", () => {
  const isActive = blooperGallery?.classList.toggle("active");

  if (!blooperGallery || isActive === undefined) {
    return;
  }

  if (!isActive) {
    blooperGallery.classList.remove("second-step");
    blooperGallery.classList.remove("third-step");
  }

  footerButton.setAttribute("aria-expanded", String(isActive));
  blooperGallery.setAttribute("aria-hidden", String(!isActive));

  if (isActive) {
    focusVisibleBlooperCard();
  }
});

blooperNextButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!blooperGallery?.classList.contains("active")) {
      return;
    }

    if (!blooperGallery.classList.contains("second-step")) {
      blooperGallery.classList.add("second-step");
      focusVisibleBlooperCard();
      return;
    }

    blooperGallery.classList.add("third-step");
    focusVisibleBlooperCard();
  });
});

blooperPrevButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (!blooperGallery?.classList.contains("active")) {
      return;
    }

    if (blooperGallery.classList.contains("third-step")) {
      blooperGallery.classList.remove("third-step");
      focusVisibleBlooperCard();
      return;
    }

    blooperGallery.classList.remove("second-step");
    focusVisibleBlooperCard();
  });
});

function focusVisibleBlooperCard() {
  if (!blooperGallery) {
    return;
  }

  let visiblePanelSelector = ".blooper-panel-primary";

  if (blooperGallery.classList.contains("third-step")) {
    visiblePanelSelector = ".blooper-panel-tertiary";
  } else if (blooperGallery.classList.contains("second-step")) {
    visiblePanelSelector = ".blooper-panel-secondary";
  }

  const visiblePanel = blooperGallery.querySelector(visiblePanelSelector);
  const visibleCard = blooperGallery.querySelector(`${visiblePanelSelector} .blooper-card`);

  if (visiblePanel instanceof HTMLElement) {
    visiblePanel.scrollIntoView({ behavior: "smooth", block: "center" });
  }

  if (!(visibleCard instanceof HTMLElement)) {
    return;
  }

  visibleCard.setAttribute("tabindex", "-1");
  window.requestAnimationFrame(() => {
    visibleCard.focus({ preventScroll: true });
  });
}

function launchGiftSurprise() {
  if (!giftBox || !giftBoxBalloons || !giftBoxScene) {
    return;
  }

  const balloons = [
    { color: "#ff8ab3", left: "20%", rise: "-13rem", drift: "-2rem", width: "3.4rem", height: "4.2rem" },
    { color: "#ffd166", left: "34%", rise: "-15rem", drift: "-0.9rem", width: "3.9rem", height: "4.8rem" },
    { color: "#d68cff", left: "50%", rise: "-14rem", drift: "0rem", width: "4.1rem", height: "5rem" },
    { color: "#7ee1ff", left: "66%", rise: "-15.5rem", drift: "1rem", width: "3.8rem", height: "4.7rem" },
    { color: "#ff9f68", left: "80%", rise: "-13.5rem", drift: "2rem", width: "3.5rem", height: "4.3rem" }
  ];

  giftBoxScene.classList.remove("open");
  giftBox.classList.remove("open");
  giftBoxBalloons.replaceChildren();
  void giftBoxScene.offsetWidth;
  giftBoxScene.classList.add("open");
  giftBox.classList.add("open");
  resetTypedLetter();
  playBirthdayMusic();

  balloons.forEach((balloon, index) => {
    const element = document.createElement("span");
    element.className = "surprise-balloon";
    element.style.setProperty("--balloon-color", balloon.color);
    element.style.setProperty("--balloon-left", balloon.left);
    element.style.setProperty("--balloon-rise", balloon.rise);
    element.style.setProperty("--balloon-drift", balloon.drift);
    element.style.setProperty("--balloon-width", balloon.width);
    element.style.setProperty("--balloon-height", balloon.height);
    element.style.animationDelay = `${index * 0.08}s`;
    giftBoxBalloons.appendChild(element);

    window.setTimeout(() => {
      element.remove();
    }, 2600 + index * 80);
  });

  window.setTimeout(() => {
    document.querySelector("#surprise-letter-panel")?.scrollIntoView({ behavior: "smooth", block: "center" });
  }, 900);

  window.setTimeout(() => {
    startTypedLetter();
  }, 1100);
}

function playBirthdayMusic() {
  if (!(birthdayMusic instanceof HTMLAudioElement)) {
    return;
  }

  birthdayMusic.currentTime = 0;
  birthdayMusic.play().catch(() => {
    // Ignore autoplay/playback failures triggered by browser/media state.
  });
}

function resetTypedLetter() {
  footer?.classList.remove("ready");

  typedLetterElements.forEach((element) => {
    element.textContent = "";
    element.classList.remove("typing");
  });
}

function startTypedLetter() {
  let paragraphIndex = 0;

  function typeNextParagraph() {
    const element = typedLetterElements[paragraphIndex];

    if (!element) {
      return;
    }

    const text = element.getAttribute("data-letter-text") ?? "";
    const words = text.split(" ");
    let wordIndex = 0;
    element.classList.add("typing");

    const intervalId = window.setInterval(() => {
      wordIndex += 1;
      const currentText = words.slice(0, wordIndex).join(" ");

      if (text.startsWith("NOTE:")) {
        const noteText = currentText.replace(/^NOTE:/, "").trimStart();
        element.innerHTML = `<span class="typed-letter-note-label">NOTE</span>:${noteText ? ` ${noteText}` : ""}`;
      } else {
        element.textContent = currentText;
      }

      if (wordIndex >= words.length) {
        window.clearInterval(intervalId);
        element.classList.remove("typing");
        paragraphIndex += 1;

        if (paragraphIndex >= typedLetterElements.length) {
          footer?.classList.add("ready");
          return;
        }

        window.setTimeout(typeNextParagraph, 280);
      }
    }, 85);
  }

  typeNextParagraph();
}

function createHeart() {
  if (!heartContainer) {
    return;
  }

  const heart = document.createElement("span");
  heart.className = "heart";
  heart.textContent = "❤";
  heart.style.left = `${Math.random() * 100}%`;
  heart.style.animationDuration = `${6 + Math.random() * 5}s`;
  heart.style.fontSize = `${0.8 + Math.random() * 1.1}rem`;
  heartContainer.appendChild(heart);

  window.setTimeout(() => {
    heart.remove();
  }, 11000);
}

window.setInterval(createHeart, 700);
