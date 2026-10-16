import { Browser } from "@capacitor/browser";
import { SplashScreen } from "@capacitor/splash-screen";
import { LiveUpdate } from "@capawesome/capacitor-live-update";

window.customElements.define(
  "capacitor-welcome",
  class extends HTMLElement {
    constructor() {
      super();

      SplashScreen.hide();

      const root = this.attachShadow({ mode: "open" });
      root.innerHTML = `
    <main>
      <h1>Capacitor App</h1>
      <p>
        This project is used to create a minimal, reproducible example. Just add
        the affected Capacitor platforms and plugins.
      </p>
      <label for="myInput">Website:</label>
      <input
        type="text"
        id="myInput"
        name="myInput"
        value="https://capacitorjs.com/"
      />
      <button id="open-browser">Open Browser</button>
    </main>
    `;
    }

    connectedCallback() {
      const self = this;

      self.shadowRoot
        .querySelector("#open-browser")
        .addEventListener("click", async function (event) {
          const input = self.shadowRoot.getElementById("myInput").value;
          if (!input) {
            return;
          }
          await Browser.open({ url: input });
        });

      // With `autoUpdateStrategy: "background"` in capacitor.config.json the
      // plugin checks for, downloads and applies updates on its own. Calling
      // `ready()` signals that the current bundle started successfully, so a
      // broken update is rolled back automatically.
      LiveUpdate.ready().then(() => {
        console.log("LiveUpdate ready");
      });
    }
  },
);
