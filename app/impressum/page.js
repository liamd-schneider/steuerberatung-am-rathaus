"use client"

export default function Impressum() {
  return (
    <div className="min-h-[100vh] ">
      {/* Header */}
      <header className=" ">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex justify-between items-center">
          <h1 className="text-2xl font-bold text-white">Steuerberatung am Rathaus Steuerberatungsgesellschaft mbH</h1>
          <a
            href="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md  text-white hover:text-black bg-[rgba(227,218,201,0.1)] hover:bg-[#E3DAC9] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E3DAC9]"
          >
            Zurück zur Startseite
          </a>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12 text-black">
        <div className="bg-[rgba(227,218,201,0.1)] shadow overflow-hidden sm:rounded-lg">
          <div className="px-4 py-5 sm:px-6 bg-[#E3DAC9]">
            <h2 className="text-2xl font-semibold text-black">Impressum</h2>
            <p className="mt-1 max-w-2xl text-sm text-black">Angaben gemäß § 5 DDG</p>
          </div>
          <div className="border-t border-gray-200 px-4 py-5 sm:p-6">
            <div className="prose max-w-none">
              <h3 className="text-lg font-medium text-white mb-4">Steuerberatung am Rathaus Steuerberatungsgesellschaft mbH</h3>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Anschrift</h4>
                  <p className="text-gray-900">
                    Kirchhellener Str. 42
                    <br />
                    46236 Bottrop
                  </p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Vertreten durch</h4>
                  <p className="text-gray-900">Hans-Georg Friemel, StB</p>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Kontakt</h4>
                  <p className="text-gray-900">
                    Tel: +49 020414066389
                    <br />
                    E-Mail: stb-am-rathaus@email.de
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h4 className="text-base font-medium text-white mb-2">Registereintrag</h4>
                  <p className="text-[#E4E4E4]">
                    Eintragung im Handelsregister.
                    <br />
                    Registergericht: Nordrhein-Westfalen Amtsgericht Gelsenkirchen
                    <br />
                    Registernummer: HRB 15514
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-medium text-white mb-2">Umsatzsteuer-ID</h4>
                  <p className="text-[#E4E4E4]">
                    Umsatzsteuer-Identifikationsnummer gemäß §27a Umsatzsteuergesetz: DE327407219
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-medium text-white mb-2">Aufsichtsbehörde</h4>
                  <p className="text-[#E4E4E4]">
                    Amtsgericht Gelsenkirchen HRB 15514, Bochumer Straße 79, 45886 Gelsenkirchen
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-medium text-white mb-2">Berufsbezeichnung</h4>
                  <p className="text-[#E4E4E4]">
                    Steuerberater
                    <br />
                    Verliehen durch: Bundesrepublik Deutschland
                    <br />
                    Zuständige Kammer: Steuerberaterkammer Westfalen-Lippe
                  </p>
                </div>

                <div>
                  <h4 className="text-base font-medium text-white mb-2">Gesellschafter</h4>
                  <p className="text-[#E4E4E4]">Hans-Georg Friemel, StB</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-[#747171] text-white py-8 ">
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
