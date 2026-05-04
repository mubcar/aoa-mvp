export async function configRoutes(app) {
  // Public: returns active feature flags (reserved for future use)
  app.get("/features", async () => ({
    paymentMode: "none",
  }));
}
