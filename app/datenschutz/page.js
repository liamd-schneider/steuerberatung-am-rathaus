"use client"

export default function Datenschutz() {
  return (
    <div className="min-h-[100vh]">
      {/* Header */}
      <header className="">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Steuerberatung am Rathaus Steuerberatungsgesellschaft mbH</h1>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent lg:text-sm text-[12px] font-medium rounded-md text-white hover:text-black bg-[rgba(227,218,201,0.1)] hover:bg-[#E3DAC9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
          >
            Zurück zur Startseite
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-black">
        {/* Datenschutzerklärung */}
        <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg mb-8">
          <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]">
            <h2 className="text-2xl font-semibold text-black">Datenschutzerklärung</h2>
            <p className="mt-1 max-w-2xl text-sm text-black">Informationen zum Datenschutz</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="prose max-w-none text-white">
              <p>
                Personenbezogene Daten (nachfolgend zumeist nur „Daten" genannt) werden von uns nur im Rahmen der
                Erforderlichkeit sowie zum Zwecke der Bereitstellung eines funktionsfähigen und nutzerfreundlichen
                Internetauftritts, inklusive seiner Inhalte und der dort angebotenen Leistungen, verarbeitet.
              </p>
              <p>
                Gemäß Art. 4 Ziffer 1. der Verordnung (EU) 2016/679, also der Datenschutz-Grundverordnung (nachfolgend
                nur „DSGVO" genannt), gilt als „Verarbeitung" jeder mit oder ohne Hilfe automatisierter Verfahren
                ausgeführter Vorgang oder jede solche Vorgangsreihe im Zusammenhang mit personenbezogenen Daten, wie das
                Erheben, das Erfassen, die Organisation, das Ordnen, die Speicherung, die Anpassung oder Veränderung,
                das Auslesen, das Abfragen, die Verwendung, die Offenlegung durch Übermittlung, Verbreitung oder eine
                andere Form der Bereitstellung, den Abgleich oder die Verknüpfung, die Einschränkung, das Löschen oder
                die Vernichtung.
              </p>
              <p>
                Mit der nachfolgenden Datenschutzerklärung informieren wir Sie insbesondere über Art, Umfang, Zweck,
                Dauer und Rechtsgrundlage der Verarbeitung personenbezogener Daten, soweit wir entweder allein oder
                gemeinsam mit anderen über die Zwecke und Mittel der Verarbeitung entscheiden. Zudem informieren wir Sie
                nachfolgend über die von uns zu Optimierungszwecken sowie zur Steigerung der Nutzungsqualität
                eingesetzten Fremdkomponenten, soweit hierdurch Dritte Daten in wiederum eigener Verantwortung
                verarbeiten.
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-4">
                I. Informationen über uns als Verantwortliche
              </h3>
              <p>Verantwortlicher Anbieter dieses Internetauftritts im datenschutzrechtlichen Sinne ist:</p>
              <p>
                Steuerberatung am Rathaus Steuerberatungsgesellschaft mbH
                <br />
                Hans-Georg Friemel
                <br />
                Kirchhellener Str. 42
                <br />
                46236 Bottrop
                <br />
                Telefon: 02041 4 06 63 89
                <br />
                Telefax: 02041 4 06 63 89
                <br />
                E-Mail: stb-am-rathaus@email.de
              </p>

              <h3 className="text-lg font-medium text-white mt-6 mb-4">II. Rechte der Nutzer und Betroffenen</h3>
              <p>
                Mit Blick auf die nachfolgend noch näher beschriebene Datenverarbeitung haben die Nutzer und Betroffenen
                das Recht
              </p>
              <ul className="list-disc pl-5 space-y-2 text-white">
                <li>
                  auf Bestätigung, ob sie betreffende Daten verarbeitet werden, auf Auskunft über die verarbeiteten
                  Daten, auf weitere Informationen über die Datenverarbeitung sowie auf Kopien der Daten (vgl. auch Art.
                  15 DSGVO);
                </li>
                <li>
                  auf Berichtigung oder Vervollständigung unrichtiger bzw. unvollständiger Daten (vgl. auch Art. 16
                  DSGVO);
                </li>
                <li>
                  auf unverzügliche Löschung der sie betreffenden Daten (vgl. auch Art. 17 DSGVO), oder, alternativ,
                  soweit eine weitere Verarbeitung gemäß Art. 17 Abs. 3 DSGVO erforderlich ist, auf Einschränkung der
                  Verarbeitung nach Maßgabe von Art. 18 DSGVO;
                </li>
                <li>
                  auf Erhalt der sie betreffenden und von ihnen bereitgestellten Daten und auf Übermittlung dieser Daten
                  an andere Anbieter/Verantwortliche (vgl. auch Art. 20 DSGVO);
                </li>
                <li>
                  auf Beschwerde gegenüber der Aufsichtsbehörde, sofern sie der Ansicht sind, dass die sie betreffenden
                  Daten durch den Anbieter unter Verstoß gegen datenschutzrechtliche Bestimmungen verarbeitet werden
                  (vgl. auch Art. 77 DSGVO).
                </li>
              </ul>

              <h3 className="text-lg font-medium text-white mt-6 mb-4">III. Informationen zur Datenverarbeitung</h3>
              <p>
                Ihre bei Nutzung unseres Internetauftritts verarbeiteten Daten werden gelöscht oder gesperrt, sobald der
                Zweck der Speicherung entfällt, der Löschung der Daten keine gesetzlichen Aufbewahrungspflichten
                entgegenstehen und nachfolgend keine anderslautenden Angaben zu einzelnen Verarbeitungsverfahren gemacht
                werden.
              </p>

              <h4 className="text-base font-medium text-white mt-4 mb-2">Cookie Manager</h4>
              <p>
                Zur Einholung einer Einwilligung zum Einsatz von technisch nicht notwendigen Cookies auf der Website,
                setzt der Anbieter einen Cookie-Manager ein.
              </p>
              <p>
                Bei dem Aufruf der Website wird ein Cookie mit den Einstellungsinformationen auf dem Endgerät des
                Nutzers abgelegt, sodass bei einem weiteren Besuch die Abfrage in Bezug auf die Einwilligung nicht
                erfolgen muss.
              </p>
              <p>Das Cookie ist erforderlich um eine rechtskonforme Einwilligung des Nutzers einzuholen.</p>
              <p>
                Die Installation der Cookies kann der Nutzer durch Einstellungen seines Browsers verhindern bzw.
                beenden.
              </p>

              <h4 className="text-base font-medium text-white mt-4 mb-2">Cookies</h4>
              <p>
                <strong>a) Sitzungs-Cookies/Session-Cookies</strong>
              </p>
              <p>
                Wir verwenden mit unserem Internetauftritt sog. Cookies. Cookies sind kleine Textdateien oder andere
                Speichertechnologien, die durch den von Ihnen eingesetzten Internet-Browser auf Ihrem Endgerät ablegt
                und gespeichert werden. Durch diese Cookies werden im individuellen Umfang bestimmte Informationen von
                Ihnen, wie beispielsweise Ihre Browser- oder Standortdaten oder Ihre IP-Adresse, verarbeitet.
              </p>
              <p>
                Durch diese Verarbeitung wird unser Internetauftritt benutzerfreundlicher, effektiver und sicherer, da
                die Verarbeitung bspw. die Wiedergabe unseres Internetauftritts in unterschiedlichen Sprachen oder das
                Angebot einer Warenkorbfunktion ermöglicht.
              </p>
              <p>
                Rechtsgrundlage dieser Verarbeitung ist Art. 6 Abs. 1 lit b.) DSGVO, sofern diese Cookies Daten zur
                Vertragsanbahnung oder Vertragsabwicklung verarbeitet werden.
              </p>
              <p>
                Falls die Verarbeitung nicht der Vertragsanbahnung oder Vertragsabwicklung dient, liegt unser
                berechtigtes Interesse in der Verbesserung der Funktionalität unseres Internetauftritts. Rechtsgrundlage
                ist in dann Art. 6 Abs. 1 lit. f) DSGVO.
              </p>
              <p>Mit Schließen Ihres Internet-Browsers werden diese Session-Cookies gelöscht.</p>

              <p className="mt-4">
                <strong>b) Drittanbieter-Cookies</strong>
              </p>
              <p>
                Gegebenenfalls werden mit unserem Internetauftritt auch Cookies von Partnerunternehmen, mit denen wir
                zum Zwecke der Werbung, der Analyse oder der Funktionalitäten unseres Internetauftritts
                zusammenarbeiten, verwendet.
              </p>
              <p>
                Die Einzelheiten hierzu, insbesondere zu den Zwecken und den Rechtsgrundlagen der Verarbeitung solcher
                Drittanbieter-Cookies, entnehmen Sie bitte den nachfolgenden Informationen.
              </p>

              <p className="mt-4">
                <strong>c) Beseitigungsmöglichkeit</strong>
              </p>
              <p>
                Sie können die Installation der Cookies durch eine Einstellung Ihres Internet-Browsers verhindern oder
                einschränken. Ebenfalls können Sie bereits gespeicherte Cookies jederzeit löschen. Die hierfür
                erforderlichen Schritte und Maßnahmen hängen jedoch von Ihrem konkret genutzten Internet-Browser ab. Bei
                Fragen benutzen Sie daher bitte die Hilfefunktion oder Dokumentation Ihres Internet-Browsers oder wenden
                sich an dessen Hersteller bzw. Support.
              </p>

              <h4 className="text-base font-medium text-white mt-4 mb-2">Kontaktanfragen / Kontaktmöglichkeit</h4>
              <p>
                Sofern Sie per Kontaktformular oder E-Mail mit uns in Kontakt treten, werden die dabei von Ihnen
                angegebenen Daten zur Bearbeitung Ihrer Anfrage genutzt. Die Angabe der Daten ist zur Bearbeitung und
                Beantwortung Ihre Anfrage erforderlich – ohne deren Bereitstellung können wir Ihre Anfrage nicht oder
                allenfalls eingeschränkt beantworten.
              </p>
              <p>Rechtsgrundlage für diese Verarbeitung ist Art. 6 Abs. 1 lit. b) DSGVO.</p>
              <p>
                Ihre Daten werden gelöscht, sofern Ihre Anfrage abschließend beantwortet worden ist und der Löschung
                keine gesetzlichen Aufbewahrungspflichten entgegenstehen, wie bspw. bei einer sich etwaig anschließenden
                Vertragsabwicklung.
              </p>

              <h4 className="text-base font-medium text-white mt-4 mb-2">Instagram</h4>
              <p>
                Zur Bewerbung unserer Produkte und Leistungen sowie zur Kommunikation mit Interessenten oder Kunden
                betreiben wir eine Firmenpräsenz auf der Plattform Instagram.
              </p>
              <p>
                Auf dieser Social-Media-Plattform sind wir gemeinsam mit der Meta Platforms Ireland Limited, 4 Grand
                Canal Square, Dublin 2, Irland, verantwortlich.
              </p>
              <p>
                Der Datenschutzbeauftragte von Instagram kann über ein Kontaktformular erreicht werden:
                <br />
                <a
                  href="https://www.facebook.com/help/contact/540977946302970"
                  target="_blank"
                  rel="noopener noreferrer"
                  className=" hover:underline"
                >
                  https://www.facebook.com/help/contact/540977946302970
                </a>
              </p>

              <h4 className="text-base font-medium text-white mt-4 mb-2">Google Analytics</h4>
              <p>
                Wir nutzen auf unserer Webseite Google Analytics, einen Webanalysedienst der Firma Google Ireland
                Limited, Gordon House, Barrow Street, Dublin 4, Irland, einem Tochterunternehmen der Google LLC, 1600
                Amphitheatre Parkway, Mountain View, CA 94043 USA, nachfolgend „Google".
              </p>
              <p>
                Google Analytics hilft uns dabei, die Nutzung der Website zu analysieren und die Effektivität unserer
                Marketing-Kampagnen zu messen. Rechtsgrundlage ist hierbei Art. 6 Abs. 1 lit. a DSGVO. Der Nutzer kann
                seine Einwilligung zur Nutzung von Google Analytics gemäß Art. 7 Abs. 3 DSGVO jederzeit über die
                „Cookie-Einstellungen" unserer Webseite für die Zukunft widerrufen.
              </p>

              <h4 className="text-base font-medium text-white mt-4 mb-2">Google Fonts</h4>
              <p>
                In unserem Internetauftritt setzen wir Google Fonts zur Darstellung externer Schriftarten ein. Es
                handelt sich hierbei um einen Dienst der Google Ireland Limited, Gordon House, Barrow Street, Dublin 4,
                Irland, nachfolgend nur „Google" genannt.
              </p>

              <h4 className="text-base font-medium text-white mt-4 mb-2">Google-Maps</h4>
              <p>
                In unserem Internetauftritt setzen wir Google Maps zur Darstellung unseres Standorts sowie zur
                Erstellung einer Anfahrtsbeschreibung ein. Es handelt sich hierbei um einen Dienst der Google Ireland
                Limited, Gordon House, Barrow Street, Dublin 4, Irland, nachfolgend nur „Google" genannt.
              </p>

              <h4 className="text-base font-medium text-white mt-4 mb-2">Hosting bei Vercel</h4>
              <p>
                Unsere Website wird bei Vercel Inc., 440 N Barranca Ave #4133, Covina, CA 91723, USA, gehostet. Vercel
                speichert alle Daten, die im Zusammenhang mit dem Betrieb dieser Website verarbeitet werden, auf Servern
                in der Europäischen Union, sofern technisch möglich, oder in den USA. Die Nutzung von Vercel erfolgt zum
                Zweck der sicheren und effizienten Bereitstellung unseres Onlineangebots durch einen professionellen
                Anbieter.
              </p>
              <p>
                Rechtsgrundlage für die Verarbeitung ist Art. 6 Abs. 1 lit. f DSGVO. Unser berechtigtes Interesse liegt
                in der Bereitstellung einer stabilen, performanten und wartbaren Website-Infrastruktur.
              </p>

              <h4 className="text-base font-medium text-white mt-4 mb-2">KI-Chatbot von Botpress</h4>
              <p>
                Auf unserer Website setzen wir einen KI-Chatbot von Botpress ein, um die Kommunikation mit Besuchern zu
                verbessern und Anfragen effizient beantworten zu können. Anbieter ist Botpress, Inc., 5605 avenue de
                Gaspé, suite 903, Montreal, QC H2T 2A4, Kanada.
              </p>
              <p>
                Der Chatbot kann personenbezogene Daten wie IP-Adresse, Chatverlauf und vom Nutzer eingegebene
                Informationen erfassen, sofern diese im Rahmen der Konversation freiwillig bereitgestellt werden. Diese
                Daten werden verarbeitet, um Ihre Anfragen zu beantworten oder gegebenenfalls an den richtigen
                Ansprechpartner weiterzuleiten.
              </p>
            </div>
          </div>
        </div>

        {/* Haftungsausschluss */}
        <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]">
            <h2 className="text-2xl font-semibold text-black">Haftungsausschluss</h2>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="prose max-w-none text-white">
              <h4 className="text-base font-medium text-white mb-2">Haftung für Inhalte</h4>
              <p className="text-white">
                Die Inhalte unserer Website wurden mit größter Sorgfalt erstellt. Für die Richtigkeit, Vollständigkeit
                und Aktualität der Inhalte können wir jedoch keine Gewähr übernehmen. Als Diensteanbieter sind wir gemäß
                § 7 Abs. 1 DDG nach den allgemeinen Gesetzen für eigene Inhalte auf diesen Seiten verantwortlich. Nach
                §§ 8 bis 10 DDG sind wir als Diensteanbieter jedoch nicht verpflichtet, übermittelte oder gespeicherte
                fremde Informationen zu überwachen oder nach Umständen zu forschen, die auf eine rechtswidrige Tätigkeit
                hinweisen. Verpflichtungen zur Entfernung oder Sperrung der Nutzung von Informationen nach den
                allgemeinen Gesetzen bleiben hiervon unberührt. Eine Haftung ist jedoch erst ab dem Zeitpunkt der
                Kenntnis einer konkreten Rechtsverletzung möglich. Bei Bekanntwerden entsprechender Rechtsverletzungen
                werden wir derartige Inhalte umgehend entfernen.
              </p>

              <h4 className="text-base font-medium text-white mt-4 mb-2">Haftung für Links</h4>
              <p className="text-white">
                Unser Angebot enthält Links zu externen Websites Dritter, auf deren Inhalte wir keinen Einfluss haben.
                Daher können wir für diese fremden Inhalte auch keine Gewähr übernehmen. Für die Inhalte der verlinkten
                Seiten ist stets der jeweilige Anbieter oder Betreiber verantwortlich. Zum Zeitpunkt der Verlinkung
                wurden die Seiten auf mögliche Rechtsverstöße überprüft. Rechtswidrige Inhalte waren zu diesem Zeitpunkt
                nicht erkennbar. Eine permanente inhaltliche Kontrolle der verlinkten Seiten ist jedoch ohne konkrete
                Anhaltspunkte einer Rechtsverletzung nicht zumutbar. Sollten uns Rechtsverletzungen bekannt werden,
                entfernen wir derartige Links umgehend.
              </p>

              <h4 className="text-base font-medium text-white mt-4 mb-2">Urheberrecht</h4>
              <p className="text-white">
                Die auf dieser Website veröffentlichten Inhalte und Werke unterliegen dem deutschen Urheberrecht. Die
                Vervielfältigung, Bearbeitung, Verbreitung und jede Art der Verwertung außerhalb der Grenzen des
                Urheberrechts bedürfen der schriftlichen Zustimmung des jeweiligen Autors bzw. Erstellers. Downloads und
                Kopien dieser Seite sind ausschließlich für den privaten, nicht kommerziellen Gebrauch gestattet. Soweit
                Inhalte nicht vom Betreiber erstellt wurden, werden die Urheberrechte Dritter beachtet und entsprechend
                gekennzeichnet. Sollten Sie dennoch auf eine Urheberrechtsverletzung aufmerksam werden, bitten wir um
                einen entsprechenden Hinweis. Bei Bekanntwerden von Rechtsverletzungen werden wir derartige Inhalte
                umgehend entfernen.
              </p>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#747171] text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <p className="text-sm">© 2025 Steuerberatung am Rathaus und Liam Schneider. Alle Rechte vorbehalten.</p>
            </div>
            <div className="flex space-x-6">
              <a href="/datenschutz" className="text-sm text-[#E3DAC9] hover:text-white">
                Datenschutz
              </a>
              <a href="/impressum" className="text-sm text-[#E3DAC9] hover:text-white">
                Impressum
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
