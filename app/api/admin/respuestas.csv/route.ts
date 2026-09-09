import { NextRequest, NextResponse } from "next/server";
import { getAdmin } from "@/lib/auth";
import { listAdminResponses } from "@/lib/repository";

function safeCell(value: unknown) {
  let text =
    value == null
      ? ""
      : Array.isArray(value)
        ? value.join(" | ")
        : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: NextRequest) {
  if (!(await getAdmin()))
    return NextResponse.json({ message: "No autorizado" }, { status: 401 });
  const q = request.nextUrl.searchParams;
  let responses = await listAdminResponses();
  if (q.get("q"))
    responses = responses.filter((item) =>
      item.businessName.toLowerCase().includes(q.get("q")!.toLowerCase()),
    );
  if (q.get("intent"))
    responses = responses.filter((item) => item.intent === q.get("intent"));
  if (q.get("plan"))
    responses = responses.filter((item) => item.plan === q.get("plan"));
  if (q.get("read") === "new")
    responses = responses.filter((item) => item.unread);
  if (q.get("read") === "pending")
    responses = responses.filter((item) => item.followupStatus === "pending");
  if (q.get("from"))
    responses = responses.filter(
      (item) => item.createdAt >= `${q.get("from")}T00:00:00.000Z`,
    );
  if (q.get("to"))
    responses = responses.filter(
      (item) => item.createdAt <= `${q.get("to")}T23:59:59.999Z`,
    );
  const rows = [
    [
      "id",
      "negocio",
      "fecha",
      "intencion",
      "valoracion",
      "tarifa",
      "nombre",
      "contacto",
      "cambios",
      "comentario",
    ],
    ...responses.map((item) => [
      item.id,
      item.businessName,
      item.createdAt,
      item.intent,
      item.impression,
      item.plan,
      item.respondentName,
      item.contactValue,
      item.answers.changes,
      item.answers.changesNote,
    ]),
  ];
  const csv = `\uFEFF${rows.map((row) => row.map(safeCell).join(",")).join("\r\n")}`;
  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": `attachment; filename="respuestas-trazo-${new Date().toISOString().slice(0, 10)}.csv"`,
      "cache-control": "private, no-store",
    },
  });
}
