/* ==========================================================================
   THE MIRROR THAT ATE THE HOTEL, companion app settings.
   Tammy: this is the only file you (or Grok Bot) edit to change price,
   payment, links, trailer and song. Codes live in codes.js (hashes only).
   ========================================================================== */
window.MIRROR_CONFIG = {
  appName: "The Mirror That Ate the Hotel: The Hotel Aurelian",

  /* ---------- Unlock price (shown on the buttons) ---------- */
  price: "$3.99",               // DECIDE: suggested $2.99 to $4.99

  /* ---------- Payment ----------
     provider: "none"   = buy button shows "coming soon" (safe default)
               "stripe" = Stripe Payment Link
               "gumroad"= Gumroad product page
     paymentUrl: the link the "Unlock the Hotel" button opens.
     THIS IS A TEST PLACEHOLDER. No real account or product exists yet.
     After paying, the provider should send buyers back to:
       <app url>/#/thanks?code=YOUR-PURCHASE-CODE
     (Stripe: Payment Link > After payment > Redirect to your website.
      Gumroad: put the code and that link in the product's thank-you content.) */
  payment: {
    provider: "none",
    paymentUrl: "https://buy.stripe.com/test_PLACEHOLDER",
    testMode: true
  },

  /* ---------- Buy the book (verified Amazon links) ---------- */
  amazon: {
    shortLink: "https://a.co/d/0atLWG3R",
    kindle: "https://www.amazon.com/dp/B0HH4GWDGJ",
    paperback: "https://www.amazon.com/dp/B0HPGG5JF8",
    hardcover: "https://www.amazon.com/dp/B0HPGZDN1Y",
    author: "https://www.amazon.com/Tammy-Michelli/e/B0GWLJKJQ3"
  },

  /* ---------- Song and trailer (PLACEHOLDERS until Tammy sends files or links) ----------
     youtubeId: just the id, for example "dQw4w9WgXcQ". Or set file: "media/song.mp3". */
  song: { title: "Every Room, Every Guest, Every Night", youtubeId: "", file: "" },
  trailer: { title: "Book trailer", youtubeId: "", file: "" },
  website: { label: "Tammy's website", url: "" },  // PLACEHOLDER: muse.ai or new site link

  /* ---------- Which rooms are free ---------- */
  freeRooms: ["lobby", "desk", "corridor", "bellstand", "giftshop"]
};
