import { Info } from "lucide-react";

/**
 * Legal disclaimer block shown on every brand and model page. Three
 * topics every Austrian repair-shop must surface up-front per UWG:
 *
 *   1. IP68 / water-resistance can NOT be guaranteed post-repair.
 *   2. We are NOT an Apple authorised service provider — parts are
 *      original-refurbished or premium aftermarket, not Apple-OEM.
 *   3. Customer is responsible for backup before handing the device in.
 *
 * Showing this before booking shields us from "you didn't tell me"
 * complaints and aligns with the WP-incumbent's "Wichtige Hinweise"
 * sidebar (audit finding from the original elfixmobile.at).
 *
 * Subtle styling: muted bg, Info-icon, small text. Visible but not
 * overshadowing the price tables.
 */

interface Props {
  /** Show the IP68/water-resistance line. Only relevant for smartphones
   * and tablets, drop it for accessories or non-rated devices. */
  showIp68?: boolean;
}

export function RepairDisclaimer({ showIp68 = true }: Props) {
  return (
    <aside
      role="note"
      aria-label="Wichtige Hinweise"
      className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.04] p-5 md:p-6"
    >
      <div className="flex items-start gap-3">
        <Info className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
        <div className="text-[13.5px] leading-[1.55] text-[#525257]">
          <strong className="font-semibold text-[#1d1d1f]">Wichtige Hinweise.</strong>
          <ul className="mt-2 space-y-1.5 list-none">
            {showIp68 && (
              <li>
                Wasser- und Staubdichtigkeit (IP-Zertifizierung) kann nach
                einer Reparatur nicht mehr zu 100 % gewährleistet werden.
              </li>
            )}
            <li>
              Wir verwenden Original-Refurbished oder geprüfte
              Premium-Ersatzteile — keine reinen OEM-Teile. 12 Monate
              Garantie auf Teil und Einbau bei uns.
            </li>
            <li>
              Bitte vor Abgabe ein Backup erstellen. Daten bleiben in
              der Regel erhalten, die Sicherung liegt aber in deiner
              Verantwortung.
            </li>
            <li>
              Preise gelten für Artikel aus unserem aktuellen Lagerbestand
              und können bei seltenen Ersatzteilen abweichen — wir
              melden uns vor der Reparatur, falls das der Fall ist.
            </li>
          </ul>
        </div>
      </div>
    </aside>
  );
}
