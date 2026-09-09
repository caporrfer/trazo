"use client";

import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  Check,
  ExternalLink,
  LockKeyhole,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Brand } from "@/components/Brand";
import {
  changeOptions,
  finalButtonLabel,
  optionLabels,
  plans,
} from "@/lib/content";
import {
  buildSteps,
  progressSection,
  sanitizeForFlow,
  type StepId,
} from "@/lib/flow";
import type { FormAnswers, ProposalPublic } from "@/lib/types";
import {
  proposalConfirmationPath,
  proposalPath,
  proposalSubmissionPath,
} from "@/lib/proposal-url";
import { validateStep } from "@/lib/validation";
import styles from "./ProposalForm.module.css";

const emptyAnswers: FormAnswers = { changes: [], desiredDomains: [] };

type LabelGroup = keyof typeof optionLabels;

function Options({
  group,
  value,
  onChange,
  multiple = false,
  values = [],
  only,
}: {
  group: LabelGroup;
  value?: string;
  onChange: (value: string) => void;
  multiple?: boolean;
  values?: string[];
  only?: string[];
}) {
  const options = Object.entries(optionLabels[group]).filter(
    ([id]) => !only || only.includes(id),
  );
  return (
    <fieldset className={styles.options}>
      <legend className="sr-only">Opciones</legend>
      {options.map(([id, label]) => (
        <label className={styles.option} key={id}>
          <input
            type={multiple ? "checkbox" : "radio"}
            name={group}
            value={id}
            checked={multiple ? values.includes(id) : value === id}
            onChange={() => onChange(id)}
          />
          <span className={styles.optionText}>{label}</span>
        </label>
      ))}
    </fieldset>
  );
}

function ErrorMessage({ children }: { children: string }) {
  return (
    <p className={styles.error} role="alert">
      <AlertCircle size={21} aria-hidden="true" />
      {children}
    </p>
  );
}

function Question({
  title,
  help,
  children,
}: {
  title: string;
  help?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <h2 className={styles.question} tabIndex={-1}>
        {title}
      </h2>
      {help && <p className={styles.help}>{help}</p>}
      {children}
    </>
  );
}

function label<K extends LabelGroup>(group: K, value?: string) {
  if (!value) return "Sin indicar";
  return (optionLabels[group] as Record<string, string>)[value] || value;
}

export function ProposalForm({
  proposal,
  preview = false,
}: {
  proposal: ProposalPublic;
  preview?: boolean;
}) {
  const router = useRouter();
  const storageKey = `trazo:draft:${proposal.id}:${proposal.formVersion}`;
  const [answers, setAnswers] = useState<FormAnswers>(emptyAnswers);
  const [current, setCurrent] = useState<StepId>("viewed");
  const [history, setHistory] = useState<StepId[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [previewComplete, setPreviewComplete] = useState(false);
  const [storageAvailable, setStorageAvailable] = useState(true);
  const [editingFromReview, setEditingFromReview] = useState(false);
  const [copiedShare, setCopiedShare] = useState<
    "form" | "demo" | "both" | null
  >(null);
  const titleRef = useRef<HTMLDivElement>(null);
  const submissionIdRef = useRef<string | null>(null);
  const steps = useMemo(() => buildSteps(answers), [answers]);
  const section = progressSection(current);

  const update = useCallback(
    (patch: Partial<FormAnswers>) => {
      setAnswers((previous) => {
        const next = sanitizeForFlow({ ...previous, ...patch });
        try {
          localStorage.setItem(storageKey, JSON.stringify(next));
        } catch {
          queueMicrotask(() => setStorageAvailable(false));
        }
        return next;
      });
      setError(null);
    },
    [storageKey],
  );

  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      queueMicrotask(() => {
        if (saved) setAnswers({ ...emptyAnswers, ...JSON.parse(saved) });
      });
    } catch {
      queueMicrotask(() => setStorageAvailable(false));
    }
  }, [storageKey]);

  useEffect(() => {
    if (!steps.includes(current))
      queueMicrotask(() => setCurrent(steps.at(-1) || "viewed"));
  }, [current, steps]);

  useEffect(() => {
    titleRef.current?.querySelector<HTMLElement>("h2")?.focus();
  }, [current]);

  useEffect(() => {
    const context = (
      document as Document & {
        modelContext?: {
          registerTool?: (tool: unknown, options?: unknown) => unknown;
        };
      }
    ).modelContext;
    if (!context?.registerTool) return;
    const lifecycle = new AbortController();
    void Promise.resolve(
      context.registerTool(
        {
          name: "prepare_proposal_response",
          title: "Preparar respuesta a la propuesta",
          description:
            "Completa respuestas visibles del formulario sin enviarlas. La persona revisará y confirmará el envío.",
          inputSchema: {
            type: "object",
            properties: {
              intent: {
                type: "string",
                enum: ["information", "changes", "talk", "share", "opinion"],
              },
              note: { type: "string", maxLength: 800 },
            },
            required: ["intent"],
            additionalProperties: false,
          },
          annotations: { readOnlyHint: false, untrustedContentHint: false },
          execute(input: { intent: FormAnswers["intent"]; note?: string }) {
            update({ intent: input.intent, changesNote: input.note });
            return {
              status: "prepared",
              nextVisibleStep: "Cómo continuar",
              requiresUserConfirmation: true,
            };
          },
        },
        { signal: lifecycle.signal },
      ),
    ).catch((reason) => {
      if (!(reason instanceof DOMException && reason.name === "AbortError"))
        console.warn(
          "No se ha podido registrar la herramienta del formulario.",
        );
    });
    return () => lifecycle.abort();
  }, [update]);

  function next() {
    const effectiveAnswers =
      current === "pricing" && !answers.plan
        ? { ...answers, plan: "updates" as const }
        : answers;
    if (effectiveAnswers !== answers) update({ plan: "updates" });
    const message = validateStep(current, effectiveAnswers);
    if (message) {
      setError(message);
      return;
    }
    const freshSteps = buildSteps(effectiveAnswers);
    if (editingFromReview && freshSteps.includes("review")) {
      setHistory((items) => [...items, current]);
      setCurrent("review");
      setEditingFromReview(false);
      setError(null);
      return;
    }
    const index = freshSteps.indexOf(current);
    const nextStep = freshSteps[index + 1];
    if (nextStep) {
      setHistory((items) => [...items, current]);
      setCurrent(nextStep);
      setError(null);
    }
  }

  function back() {
    const previous = history.at(-1);
    if (previous) {
      setHistory((items) => items.slice(0, -1));
      setCurrent(previous);
      if (previous === "review") setEditingFromReview(false);
      setError(null);
    }
  }

  function edit(step: StepId) {
    setHistory((items) => [...items, current]);
    setEditingFromReview(true);
    setCurrent(step);
  }

  async function copyShare(kind: "form" | "demo" | "both") {
    const formUrl = preview
      ? `${window.location.origin}${proposalPath(proposal.slug)}`
      : window.location.href;
    const text =
      kind === "form"
        ? formUrl
        : kind === "demo"
          ? proposal.demoUrl
          : `Propuesta web: ${proposal.demoUrl}\nFormulario para responder: ${formUrl}`;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedShare(kind);
    } catch {
      setError(
        "No hemos podido copiar el enlace. Mantén pulsado sobre él para copiarlo manualmente.",
      );
    }
  }

  function clearDraft() {
    localStorage.removeItem(storageKey);
    submissionIdRef.current = null;
    setAnswers(emptyAnswers);
    setHistory([]);
    setCurrent("viewed");
  }

  async function submit() {
    if (preview) {
      setPreviewComplete(true);
      setError(null);
      titleRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const response = await fetch(
        proposalSubmissionPath(proposal.slug),
        {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify({
            requestId: (submissionIdRef.current ||= crypto.randomUUID()),
            formVersion: proposal.formVersion,
            answers,
            company: "",
          }),
        },
      );
      const result = await response.json();
      if (!response.ok)
        throw new Error(
          result.message || "No hemos podido enviar la respuesta.",
        );
      localStorage.removeItem(storageKey);
      submissionIdRef.current = null;
      sessionStorage.setItem(
        `trazo:confirmation:${proposal.id}`,
        JSON.stringify({
          intent: answers.intent,
          contactMethod: answers.contactMethod,
        }),
      );
      router.push(proposalConfirmationPath(proposal.slug));
    } catch (reason) {
      setError(
        reason instanceof Error
          ? reason.message
          : "No hemos podido enviar la respuesta. Comprueba la conexión e inténtalo de nuevo.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  function stepContent() {
    switch (current) {
      case "viewed":
        return (
          <Question
            title="¿Has podido ver el borrador?"
            help="Elige la opción que mejor encaje; podrás volver atrás cuando quieras."
          >
            <Options
              group="viewed"
              value={answers.viewed}
              onChange={(viewed) =>
                update({
                  viewed: viewed as FormAnswers["viewed"],
                  intent: undefined,
                  impression: undefined,
                })
              }
            />
          </Question>
        );
      case "demoHelp":
        return (
          <Question
            title="Puedes verlo ahora o pedirnos ayuda"
            help="Abrir la propuesta no cambia tu respuesta. Cuando vuelvas, indícanos si has podido revisarla."
          >
            <a
              className={`button button-primary ${styles.demoLink}`}
              href={proposal.demoUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver la propuesta web <ExternalLink size={20} aria-hidden="true" />
              <span className="sr-only"> (se abre en otra pestaña)</span>
            </a>
            <div className={styles.options}>
              <button
                className={styles.option}
                type="button"
                onClick={() => update({ viewed: "skimmed", intent: undefined })}
              >
                <Check size={23} aria-hidden="true" />
                Ya he podido verla
              </button>
              <button
                className={styles.option}
                type="button"
                onClick={() => update({ intent: "demo_help" })}
              >
                <span aria-hidden="true">?</span>Necesito ayuda para abrirla
              </button>
            </div>
          </Question>
        );
      case "impression":
        return (
          <Question
            title="¿Qué te ha parecido la propuesta?"
            help="No hay respuestas correctas: nos ayuda conocer tu primera impresión."
          >
            <Options
              group="impression"
              value={answers.impression}
              onChange={(impression) =>
                update({
                  impression: impression as FormAnswers["impression"],
                  fitClarification: undefined,
                  intent: impression === "no_need" ? "decline" : undefined,
                })
              }
            />
          </Question>
        );
      case "fit":
        return (
          <Question
            title="¿Te gustaría que probásemos otro enfoque?"
            help="Podemos replantear la propuesta o dejarlo aquí, sin compromiso."
          >
            <Options
              group="fitClarification"
              value={answers.fitClarification}
              onChange={(fitClarification) =>
                update({
                  fitClarification:
                    fitClarification as FormAnswers["fitClarification"],
                  intent: fitClarification === "finish" ? "decline" : undefined,
                })
              }
            />
          </Question>
        );
      case "changes":
        return (
          <Question
            title="¿Qué cambiarías o añadirías?"
            help="Puedes marcar varias opciones. Es opcional concretar los detalles."
          >
            <fieldset className={styles.options}>
              <legend className="sr-only">Cambios que te interesan</legend>
              {changeOptions.map(([id, text]) => (
                <label className={styles.option} key={id}>
                  <input
                    type="checkbox"
                    checked={answers.changes.includes(id)}
                    onChange={() =>
                      update({
                        changes: answers.changes.includes(id)
                          ? answers.changes.filter((item) => item !== id)
                          : [...answers.changes, id],
                      })
                    }
                  />
                  <span>{text}</span>
                </label>
              ))}
            </fieldset>
            <div className={styles.field}>
              <label htmlFor="changesNote">
                Cuéntanos brevemente qué tienes en mente{" "}
                <span className="muted">(opcional)</span>
              </label>
              <textarea
                className={styles.textarea}
                id="changesNote"
                maxLength={800}
                value={answers.changesNote || ""}
                onChange={(event) =>
                  update({ changesNote: event.target.value })
                }
              />
              <span className={styles.fieldHint}>
                Con un par de frases es suficiente.
              </span>
            </div>
          </Question>
        );
      case "intent":
        return (
          <Question
            title="¿Cómo te gustaría continuar?"
            help="Esto no supone contratar ni realizar ningún pago."
          >
            <Options
              group="intent"
              only={["information", "changes", "talk", "share", "opinion"]}
              value={answers.intent}
              onChange={(intent) =>
                update({ intent: intent as FormAnswers["intent"] })
              }
            />
          </Question>
        );
      case "goal":
        return (
          <Question
            title="¿Qué debería conseguir principalmente vuestra web?"
            help="Puedes elegir un objetivo principal o pedirnos asesoramiento."
          >
            <Options
              group="goal"
              value={answers.goal}
              onChange={(goal) => update({ goal: goal as FormAnswers["goal"] })}
            />
          </Question>
        );
      case "pricing":
        return (
          <Question
            title="Estas son las opciones disponibles"
            help="Indicar una opción no supone contratarla todavía."
          >
            <div className={styles.priceGrid}>
              {plans.map((plan) => {
                const recommended = "recommended" in plan && plan.recommended;
                const selectedPlan = answers.plan || "updates";
                return (
                  <article
                    className={`${styles.priceCard} ${recommended ? styles.recommended : ""}`}
                    key={plan.id}
                  >
                    {recommended && (
                      <span className={styles.badge}>Recomendada</span>
                    )}
                    <h3>{plan.name}</h3>
                    <div className={styles.price}>{plan.price}</div>
                    <p>{plan.description}</p>
                    <ul>
                      {plan.items.map((item) => (
                        <li key={item}>{item}</li>
                      ))}
                    </ul>
                    {plan.id === "updates" && (
                      <p className={styles.priceExplanation}>
                        Nos ocupamos de mantener vuestro contenido actualizado.
                        Si más adelante necesitáis una función nueva o cambiar
                        por completo la web, lo valoramos con vosotros antes de
                        empezar.
                      </p>
                    )}
                    <label className={styles.option}>
                      <input
                        type="radio"
                        name="plan"
                        value={plan.id}
                        aria-label={`Me interesa ${plan.name}`}
                        checked={selectedPlan === plan.id}
                        onChange={() =>
                          update({ plan: plan.id as FormAnswers["plan"] })
                        }
                      />
                      <span>Me interesa esta opción</span>
                    </label>
                  </article>
                );
              })}
            </div>
            <Options
              group="plan"
              only={["advice", "not_yet"]}
              value={answers.plan}
              onChange={(plan) => update({ plan: plan as FormAnswers["plan"] })}
            />
          </Question>
        );
      case "domain":
        return (
          <Question
            title="¿Ya tenéis un dominio para la web?"
            help="Puedes saltar esta pregunta si todavía no lo habéis decidido."
          >
            <Options
              group="domainStatus"
              value={answers.domainStatus}
              onChange={(domainStatus) =>
                update({
                  domainStatus: domainStatus as FormAnswers["domainStatus"],
                })
              }
            />
            {answers.domainStatus === "existing" && (
              <div className={styles.field}>
                <label htmlFor="currentDomain">
                  ¿Cuál es vuestro dominio actual?
                </label>
                <input
                  className={styles.input}
                  id="currentDomain"
                  inputMode="url"
                  placeholder="restaurantepaco.es"
                  value={answers.currentDomain || ""}
                  onChange={(event) =>
                    update({ currentDomain: event.target.value })
                  }
                />
              </div>
            )}
            {answers.domainStatus === "wanted" && (
              <div>
                <p className={styles.fieldLegend}>
                  ¿Cómo te gustaría que se llamase la web?
                </p>
                {[0, 1, 2].map((index) => (
                  <div className={styles.field} key={index}>
                    <label htmlFor={`domain-${index}`}>
                      Opción {index + 1}
                      {index > 0 && " (opcional)"}
                    </label>
                    <input
                      className={styles.input}
                      id={`domain-${index}`}
                      inputMode="url"
                      placeholder={index === 0 ? "restaurantepaco.es" : ""}
                      value={answers.desiredDomains[index] || ""}
                      onChange={(event) => {
                        const desiredDomains = [...answers.desiredDomains];
                        desiredDomains[index] = event.target.value;
                        update({ desiredDomains });
                      }}
                    />
                  </div>
                ))}
                <p className="notice">
                  Comprobaremos la disponibilidad antes de confirmar el dominio
                  definitivo.
                </p>
              </div>
            )}
          </Question>
        );
      case "person":
        return (
          <Question
            title="¿Con quién estamos hablando?"
            help="Estos datos son opcionales. No necesitamos los datos personales del propietario."
          >
            <div className={styles.field}>
              <label htmlFor="name">
                Nombre <span className="muted">(opcional)</span>
              </label>
              <input
                className={styles.input}
                id="name"
                autoComplete="name"
                maxLength={100}
                value={answers.respondentName || ""}
                onChange={(event) =>
                  update({ respondentName: event.target.value })
                }
              />
            </div>
            <p className={styles.fieldLegend}>
              Relación con el negocio <span className="muted">(opcional)</span>
            </p>
            <Options
              group="relationship"
              value={answers.relationship}
              onChange={(relationship) =>
                update({
                  relationship: relationship as FormAnswers["relationship"],
                })
              }
            />
            <p className={styles.fieldLegend}>
              ¿Participas en la decisión sobre la web?{" "}
              <span className="muted">(opcional)</span>
            </p>
            <Options
              group="decisionRole"
              value={answers.decisionRole}
              onChange={(decisionRole) =>
                update({
                  decisionRole: decisionRole as FormAnswers["decisionRole"],
                })
              }
            />
            {answers.intent === "share" && (
              <div className={styles.shareBox}>
                <strong>Comparte la propuesta</strong>
                <span>
                  Copia el formulario, la demo o ambos enlaces y envíaselos a la
                  persona responsable.
                </span>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => copyShare("form")}
                >
                  {copiedShare === "form"
                    ? "Formulario copiado"
                    : "Copiar formulario"}
                </button>
                <button
                  className="button button-secondary"
                  type="button"
                  onClick={() => copyShare("demo")}
                >
                  {copiedShare === "demo" ? "Demo copiada" : "Copiar demo"}
                </button>
                <button
                  className="button button-primary"
                  type="button"
                  onClick={() => copyShare("both")}
                >
                  {copiedShare === "both"
                    ? "Enlaces copiados"
                    : "Copiar ambos enlaces"}
                </button>
                {copiedShare && (
                  <span className="sr-only" role="status">
                    Contenido copiado.
                  </span>
                )}
                <div className={styles.field}>
                  <label htmlFor="relayEmail">
                    Correo profesional del negocio{" "}
                    <span className="muted">(opcional)</span>
                  </label>
                  <input
                    className={styles.input}
                    id="relayEmail"
                    type="email"
                    value={answers.relayEmail || ""}
                    onChange={(event) =>
                      update({ relayEmail: event.target.value })
                    }
                  />
                </div>
              </div>
            )}
          </Question>
        );
      case "contact":
        return (
          <Question
            title="¿Cómo prefieres que contactemos contigo?"
            help="Solo te pediremos el dato necesario para la opción que elijas."
          >
            <Options
              group="contactMethod"
              value={answers.contactMethod}
              onChange={(contactMethod) =>
                update({
                  contactMethod: contactMethod as FormAnswers["contactMethod"],
                  contactValue: undefined,
                  contactTime: undefined,
                  preferredDateTime: undefined,
                })
              }
            />
            {answers.contactMethod && answers.contactMethod !== "relay" && (
              <div className={styles.field}>
                <label htmlFor="contactValue">
                  {answers.contactMethod === "email"
                    ? "Correo electrónico"
                    : answers.contactMethod === "whatsapp"
                      ? "Número de WhatsApp"
                      : "Número de teléfono"}
                </label>
                <input
                  className={styles.input}
                  id="contactValue"
                  type={answers.contactMethod === "email" ? "email" : "tel"}
                  autoComplete={
                    answers.contactMethod === "email" ? "email" : "tel"
                  }
                  required
                  value={answers.contactValue || ""}
                  onChange={(event) =>
                    update({ contactValue: event.target.value })
                  }
                />
              </div>
            )}
            {answers.contactMethod && answers.contactMethod !== "relay" && (
              <>
                <p className={styles.fieldLegend}>
                  ¿Cuándo te viene mejor?{" "}
                  <span className="muted">(opcional)</span>
                </p>
                <Options
                  group="contactTime"
                  value={answers.contactTime}
                  onChange={(contactTime) =>
                    update({
                      contactTime: contactTime as FormAnswers["contactTime"],
                    })
                  }
                />
                {answers.contactTime === "specific" && (
                  <div className={styles.field}>
                    <label htmlFor="preferredDate">
                      Día y hora aproximados
                    </label>
                    <input
                      className={styles.input}
                      id="preferredDate"
                      type="datetime-local"
                      value={answers.preferredDateTime || ""}
                      onChange={(event) =>
                        update({ preferredDateTime: event.target.value })
                      }
                    />
                    <span className={styles.fieldHint}>
                      Hora peninsular española. Confirmaremos el momento
                      contigo.
                    </span>
                  </div>
                )}
              </>
            )}
          </Question>
        );
      case "decline":
        return (
          <Question
            title="¿Podrías indicarnos el motivo principal?"
            help="Esta respuesta es opcional y nos ayuda a mejorar."
          >
            <Options
              group="declineReason"
              value={answers.declineReason}
              onChange={(declineReason) =>
                update({
                  declineReason: declineReason as FormAnswers["declineReason"],
                  intent: "decline",
                })
              }
            />
            {answers.declineReason === "other" && (
              <div className={styles.field}>
                <label htmlFor="declineNote">
                  Otro motivo <span className="muted">(opcional)</span>
                </label>
                <textarea
                  className={styles.textarea}
                  id="declineNote"
                  maxLength={500}
                  value={answers.declineNote || ""}
                  onChange={(event) =>
                    update({ declineNote: event.target.value })
                  }
                />
              </div>
            )}
          </Question>
        );
      case "review":
        return <Review answers={answers} edit={edit} />;
    }
  }

  return (
    <main id="contenido" className={styles.page}>
      <header className={styles.masthead}>
        <Brand href="/" compact />
        <div className={styles.proposalIdentity}>
          <strong>{proposal.businessName}</strong>
          <a href={proposal.demoUrl} target="_blank" rel="noreferrer">
            Ver la propuesta web
            <ExternalLink size={16} aria-hidden="true" />
            <span className="sr-only"> (se abre en otra pestaña)</span>
          </a>
        </div>
        {preview && (
          <div className={styles.secureNote}>
            <LockKeyhole size={17} aria-hidden="true" />
            <span>Vista previa privada</span>
          </div>
        )}
      </header>
      <div className={styles.shell}>
        <div className={styles.formColumn}>
          <h1 className="sr-only">
            Propuesta web para {proposal.businessName}
          </h1>
          <ol className={styles.progress} aria-label="Progreso">
            <li
              className={
                section === 0 ? styles.active : section > 0 ? styles.done : ""
              }
            >
              Tu opinión
            </li>
            <li
              className={
                section === 1 ? styles.active : section > 1 ? styles.done : ""
              }
            >
              Cómo continuar
            </li>
            <li className={section === 2 ? styles.active : ""}>Revisar</li>
          </ol>
          {preview && (
            <p className="notice" role="status">
              Vista previa administrativa: puedes recorrer el formulario, pero
              no se guardará ninguna respuesta.
            </p>
          )}
          <section className={styles.card} ref={titleRef}>
            {stepContent()}
            {error && <ErrorMessage>{error}</ErrorMessage>}
            {previewComplete && (
              <p className="notice" role="status">
                Vista previa completada. La respuesta no se ha guardado.
              </p>
            )}
            <div className={styles.actions}>
              {history.length > 0 && (
                <button
                  type="button"
                  className="button button-quiet"
                  onClick={back}
                >
                  <ArrowLeft size={20} aria-hidden="true" />
                  Anterior
                </button>
              )}
              {current === "review" ? (
                <button
                  type="button"
                  className="button button-primary"
                  disabled={submitting}
                  onClick={submit}
                >
                  {preview
                    ? "Completar vista previa"
                    : submitting
                      ? "Enviando…"
                      : finalButtonLabel(answers)}
                </button>
              ) : (
                <button
                  type="button"
                  className="button button-primary"
                  onClick={next}
                >
                  {editingFromReview && steps.includes("review")
                    ? "Volver al resumen"
                    : "Continuar"}{" "}
                  <ArrowRight size={20} aria-hidden="true" />
                </button>
              )}
            </div>
            {current === "review" && !preview && (
              <p className={styles.privacy}>
                Usaremos tus datos únicamente para gestionar esta propuesta y
                contactarte si lo solicitas.{" "}
                <Link href="/privacidad" target="_blank">
                  Consulta la información de privacidad
                </Link>
                .
              </p>
            )}
          </section>
          <div className={styles.draftBar}>
            <span>
              {storageAvailable
                ? "Tu progreso se guarda en este dispositivo."
                : "El progreso se conservará mientras mantengas esta página abierta."}
            </span>
            <button
              className={styles.linkButton}
              type="button"
              onClick={clearDraft}
            >
              <RotateCcw size={16} aria-hidden="true" /> Borrar borrador
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}

function Review({
  answers,
  edit,
}: {
  answers: FormAnswers;
  edit: (step: StepId) => void;
}) {
  const changes = answers.changes
    .map((id) => changeOptions.find(([value]) => value === id)?.[1])
    .filter(Boolean)
    .join(", ");
  const items = [
    {
      title: "Borrador",
      text: label("viewed", answers.viewed),
      step: "viewed" as StepId,
    },
    answers.impression && {
      title: "Tu opinión",
      text: label("impression", answers.impression),
      step: "impression" as StepId,
    },
    changes && {
      title: "Cambios",
      text: `${changes}${answers.changesNote ? `. ${answers.changesNote}` : ""}`,
      step: "changes" as StepId,
    },
    {
      title: "Cómo continuar",
      text: label("intent", answers.intent),
      step: "intent" as StepId,
    },
    answers.goal && {
      title: "Objetivo principal",
      text: label("goal", answers.goal),
      step: "goal" as StepId,
    },
    answers.plan && {
      title: "Opción que te interesa",
      text: label("plan", answers.plan),
      step: "pricing" as StepId,
    },
    answers.domainStatus && {
      title: "Dominio",
      text:
        answers.currentDomain ||
        answers.desiredDomains.filter(Boolean).join(", ") ||
        label("domainStatus", answers.domainStatus),
      step: "domain" as StepId,
    },
    (answers.respondentName || answers.relationship) && {
      title: "Persona que responde",
      text: [
        answers.respondentName,
        label("relationship", answers.relationship),
      ]
        .filter((value) => value && value !== "Sin indicar")
        .join(" · "),
      step: "person" as StepId,
    },
    answers.contactMethod && {
      title: "Contacto",
      text: [
        label("contactMethod", answers.contactMethod),
        answers.contactValue,
        label("contactTime", answers.contactTime),
      ]
        .filter((value) => value && value !== "Sin indicar")
        .join(" · "),
      step: "contact" as StepId,
    },
    answers.declineReason && {
      title: "Motivo",
      text: label("declineReason", answers.declineReason),
      step: "decline" as StepId,
    },
  ].filter(Boolean) as { title: string; text: string; step: StepId }[];
  return (
    <Question
      title="Revisa tus respuestas"
      help="Todavía puedes corregir cualquier apartado. Enviar no supone contratar ni realizar un pago."
    >
      <div className={styles.reviewList}>
        {items.map((item) => (
          <article className={styles.reviewItem} key={item.title}>
            <div className={styles.reviewItemHeader}>
              <h3>{item.title}</h3>
              <button
                type="button"
                className={styles.editButton}
                onClick={() => edit(item.step)}
              >
                Editar <span className="sr-only">{item.title}</span>
              </button>
            </div>
            <p>{item.text}</p>
          </article>
        ))}
      </div>
    </Question>
  );
}
