import { getSupabase } from "../config/supabase.js";

function checkAuth(request, reply) {
  const secret = process.env.ADMIN_SECRET;
  if (!secret) {
    reply.status(500).send({ error: "ADMIN_SECRET not configured on server" });
    return false;
  }
  const token = (request.headers.authorization || "").replace("Bearer ", "").trim();
  if (token !== secret) {
    reply.status(401).send({ error: "Unauthorized" });
    return false;
  }
  return true;
}

function slugify(name) {
  return name
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "");
}

export async function adminRoutes(app) {
  /** Verify admin password — returns the token to store client-side */
  app.post("/auth", async (request, reply) => {
    const { password } = request.body || {};
    const secret = process.env.ADMIN_SECRET;
    if (!secret) return reply.status(500).send({ error: "ADMIN_SECRET not configured" });
    if (password !== secret) return reply.status(401).send({ error: "Senha incorreta" });
    return { ok: true, token: secret };
  });

  /** List all businesses */
  app.get("/businesses", async (request, reply) => {
    if (!checkAuth(request, reply)) return;
    const sb = getSupabase();
    const { data, error } = await sb
      .from("businesses")
      .select("id, name, slug, phone, whatsapp_number, whatsapp_instance, services, service_area, ai_prompt_context, business_hours, owner_id, created_at")
      .order("created_at", { ascending: false });
    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  /** Create a business. Optionally links to owner by email. */
  app.post("/businesses", async (request, reply) => {
    if (!checkAuth(request, reply)) return;
    const sb = getSupabase();

    const {
      name,
      phone,
      whatsapp_number,
      whatsapp_instance,
      services,
      service_area,
      ai_prompt_context,
      business_hours_start = "08:00",
      business_hours_end = "18:00",
      owner_email,
      slug: customSlug,
    } = request.body || {};

    if (!name) return reply.status(400).send({ error: "name é obrigatório" });

    const slug = customSlug || slugify(name);

    // Resolve owner_id from email if provided
    let owner_id = null;
    if (owner_email) {
      const { data: usersData } = await sb.auth.admin.listUsers();
      const match = usersData?.users?.find((u) => u.email === owner_email);
      if (match) owner_id = match.id;
    }

    const { data, error } = await sb
      .from("businesses")
      .insert({
        name,
        slug,
        phone: phone || null,
        whatsapp_number: whatsapp_number || null,
        whatsapp_instance: whatsapp_instance || null,
        services: Array.isArray(services) ? services : (services || "").split(",").map((s) => s.trim()).filter(Boolean),
        service_area: service_area || null,
        ai_prompt_context: ai_prompt_context || null,
        business_hours: { start: business_hours_start, end: business_hours_end },
        owner_id,
      })
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  /** Update a business */
  app.patch("/businesses/:id", async (request, reply) => {
    if (!checkAuth(request, reply)) return;
    const sb = getSupabase();
    const { id } = request.params;

    const allowed = [
      "name", "slug", "phone", "whatsapp_number", "whatsapp_instance",
      "notification_whatsapp", "service_area", "ai_prompt_context", "owner_id",
    ];
    const updates = {};
    for (const key of allowed) {
      if (request.body[key] !== undefined) updates[key] = request.body[key];
    }

    // Handle services array
    if (request.body.services !== undefined) {
      updates.services = Array.isArray(request.body.services)
        ? request.body.services
        : request.body.services.split(",").map((s) => s.trim()).filter(Boolean);
    }

    // Handle business hours
    if (request.body.business_hours_start || request.body.business_hours_end) {
      const { data: existing } = await sb.from("businesses").select("business_hours").eq("id", id).single();
      updates.business_hours = {
        start: request.body.business_hours_start || existing?.business_hours?.start || "08:00",
        end: request.body.business_hours_end || existing?.business_hours?.end || "18:00",
      };
    }

    const { data, error } = await sb
      .from("businesses")
      .update(updates)
      .eq("id", id)
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return data;
  });

  /** Assign owner to business by email */
  app.post("/businesses/:id/assign-owner", async (request, reply) => {
    if (!checkAuth(request, reply)) return;
    const sb = getSupabase();
    const { id } = request.params;
    const { email } = request.body || {};

    if (!email) return reply.status(400).send({ error: "email é obrigatório" });

    const { data: usersData, error: usersError } = await sb.auth.admin.listUsers();
    if (usersError) return reply.status(500).send({ error: usersError.message });

    const match = usersData?.users?.find((u) => u.email === email);
    if (!match) return reply.status(404).send({ error: `Nenhum usuário encontrado com email: ${email}` });

    const { data, error } = await sb
      .from("businesses")
      .update({ owner_id: match.id })
      .eq("id", id)
      .select()
      .single();

    if (error) return reply.status(500).send({ error: error.message });
    return { ok: true, business: data, owner_id: match.id };
  });

  /** Delete a business */
  app.delete("/businesses/:id", async (request, reply) => {
    if (!checkAuth(request, reply)) return;
    const sb = getSupabase();
    const { error } = await sb.from("businesses").delete().eq("id", request.params.id);
    if (error) return reply.status(500).send({ error: error.message });
    return { ok: true };
  });

  /** List all signed-up users */
  app.get("/users", async (request, reply) => {
    if (!checkAuth(request, reply)) return;
    const sb = getSupabase();
    const { data, error } = await sb.auth.admin.listUsers();
    if (error) return reply.status(500).send({ error: error.message });
    return (data?.users || []).map((u) => ({
      id: u.id,
      email: u.email,
      created_at: u.created_at,
      last_sign_in: u.last_sign_in_at,
    }));
  });
}
