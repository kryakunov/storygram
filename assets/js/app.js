(function () {
  var toastEl = document.getElementById("toast");
  function toast(message) {
    if (!toastEl) return;
    toastEl.hidden = false;
    toastEl.textContent = message;
    clearTimeout(toastEl._t);
    toastEl._t = setTimeout(function () {
      toastEl.hidden = true;
    }, 2200);
  }

  try {
    var html = document.documentElement;
    var dark = html.classList.contains("dark");
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch (e) {}

  document.querySelectorAll("[data-copy-link]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      if (navigator.clipboard) {
        navigator.clipboard.writeText(window.location.href).then(function () {
          toast((window.__i18n && window.__i18n.copied) || "OK");
        });
      }
    });
  });

  document.querySelectorAll("[data-save-search]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      var username = btn.getAttribute("data-save-search");
      var base = document.documentElement.getAttribute("data-base") || "";
      fetch(base + "/api/saved-searches", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ username: username }),
      })
        .then(function (res) {
          var i18n = window.__i18n || {};
          if (res.ok) toast((i18n.saved || "Saved @{username}").replace("{username}", username));
          else toast(i18n.saveFailed || "Error");
        })
        .catch(function () {
          toast((window.__i18n && window.__i18n.saveFailed) || "Error");
        });
    });
  });

  var dataEl = document.getElementById("stories-data");
  var i18nEl = document.getElementById("stories-i18n");
  if (!dataEl) return;
  var stories = JSON.parse(dataEl.textContent || "[]");
  var i18n = JSON.parse((i18nEl && i18nEl.textContent) || "{}");
  window.__i18n = i18n;
  var index = 0;
  var timer = null;
  var viewer = document.getElementById("viewer");
  var media = document.getElementById("viewer-media");
  var bars = document.getElementById("viewer-bars");

  function captionOf(story) {
    return (i18n.captions && i18n.captions[story.providerStoryId]) || story.caption || "";
  }

  function setProgress(i, pct) {
    var fills = bars.querySelectorAll("i");
    fills.forEach(function (el, n) {
      el.style.width = n < i ? "100%" : n === i ? pct + "%" : "0%";
    });
  }

  function render(i) {
    index = (i + stories.length) % stories.length;
    var story = stories[index];
    bars.innerHTML = stories
      .map(function () {
        return "<span><i></i></span>";
      })
      .join("");
    var caption = captionOf(story);
    var kind = story.mediaType === "video" ? i18n.video : i18n.image;
    if (story.mediaType === "video") {
      media.innerHTML =
        '<video src="' +
        story.mediaUrl +
        '" poster="' +
        (story.thumbnailUrl || "") +
        '" autoplay playsinline controls></video>' +
        '<div class="viewer-caption"><p>' +
        caption +
        "</p><p>" +
        (index + 1) +
        " / " +
        stories.length +
        " · " +
        kind +
        "</p></div>";
      var video = media.querySelector("video");
      video.addEventListener("timeupdate", function () {
        if (video.duration) setProgress(index, (video.currentTime / video.duration) * 100);
      });
      video.addEventListener("ended", function () {
        render(index + 1);
      });
      video.addEventListener("error", function () {
        media.querySelector(".viewer-caption p").textContent = i18n.unavailable;
      });
    } else {
      media.innerHTML =
        '<img src="' +
        story.mediaUrl +
        '" alt="' +
        caption +
        '">' +
        '<div class="viewer-caption"><p>' +
        caption +
        "</p><p>" +
        (index + 1) +
        " / " +
        stories.length +
        " · " +
        kind +
        "</p></div>";
      var started = Date.now();
      clearInterval(timer);
      timer = setInterval(function () {
        var pct = Math.min(((Date.now() - started) / 5000) * 100, 100);
        setProgress(index, pct);
        if (pct >= 100) {
          clearInterval(timer);
          render(index + 1);
        }
      }, 50);
    }
    setProgress(index, 0);
  }

  function open(i) {
    viewer.hidden = false;
    render(i);
  }
  function close() {
    viewer.hidden = true;
    clearInterval(timer);
    var video = media.querySelector("video");
    if (video) video.pause();
  }

  document.querySelectorAll("[data-open-story]").forEach(function (btn) {
    btn.addEventListener("click", function () {
      open(parseInt(btn.getAttribute("data-open-story"), 10) || 0);
    });
  });
  viewer.querySelector("[data-prev]").addEventListener("click", function () {
    render(index - 1);
  });
  viewer.querySelector("[data-next]").addEventListener("click", function () {
    render(index + 1);
  });
  viewer.querySelector("[data-close]").addEventListener("click", close);
  viewer.addEventListener("click", function (event) {
    if (event.target === viewer) close();
  });
  window.addEventListener("keydown", function (event) {
    if (viewer.hidden) return;
    if (event.key === "ArrowRight") render(index + 1);
    if (event.key === "ArrowLeft") render(index - 1);
    if (event.key === "Escape") close();
  });
})();
