const lessonCards = [...document.querySelectorAll('.lesson-card')];
const progressFill = document.querySelector('#progress-fill');
const progressLabel = document.querySelector('#progress-label');
const taskProgressLabel = document.querySelector('#task-progress-label');
const progressPercent = document.querySelector('#progress-percent');
const progressBar = document.querySelector('.progress-track');
const searchInput = document.querySelector('#lesson-search');
const emptyState = document.querySelector('#empty-state');
const toast = document.querySelector('#toast');
const saveStatus = document.querySelector('#save-status');
const resetProgressButton = document.querySelector('#reset-progress');
const storageKey = 'codequest-progress-v1';
const legacyStorageKey = 'codequest-completed-lessons';
let activeFilter = 'all';
let toastTimer;
const stableLessonIds = [
  'lesson-how-does-the-web-work',
  'lesson-give-a-page-its-structure',
  'lesson-make-it-look-the-way-you-imagined',
  'lesson-store-and-work-with-information',
  'lesson-teach-your-code-to-make-decisions',
  'lesson-bundle-steps-into-functions',
  'lesson-meet-c-and-c',
  'lesson-types-variables-and-memory',
  'lesson-keep-related-data-together',
  'lesson-debug-test-and-keep-improving',
  'lesson-write-code-thoughtfully',
];

const lessonTasks = {
  'lesson-how-does-the-web-work': [
    { id: 'name-the-parts', text: 'Pomenuj browser, server, request a response pri návšteve webovej stránky.' },
    { id: 'draw-a-request', text: 'Nakresli alebo opíš, čo sa stane po zadaní webovej adresy.' },
    { id: 'explain-the-languages', text: 'Vysvetli, čo na stránke zabezpečujú HTML, CSS a JavaScript.' },
  ],
  'lesson-give-a-page-its-structure': [
    { id: 'make-a-page', text: 'Vytvor stránku s jedným hlavným nadpisom a dvoma odsekmi.' },
    { id: 'add-navigation', text: 'Pridaj odkaz a vhodne použi elementy main, nav alebo article.' },
    { id: 'describe-an-image', text: 'Pridaj obrázok s alt textom, ktorý opíše jeho dôležitý obsah.' },
  ],
  'lesson-make-it-look-the-way-you-imagined': [
    { id: 'style-a-heading', text: 'Vyber nadpis a zmeň jeho farbu, veľkosť a okraje pomocou CSS.' },
    { id: 'box-model', text: 'Pridaj karte padding a border; vysvetli rozdiel medzi padding a margin.' },
    { id: 'responsive-layout', text: 'Umiestni dve karty vedľa seba a na úzkej obrazovke ich poukladaj pod seba.' },
  ],
  'lesson-store-and-work-with-information': [
    { id: 'choose-variables', text: 'Ulož meno pomocou const a skóre, ktoré sa mení, pomocou let.' },
    { id: 'make-a-greeting', text: 'Vytvor pozdrav pomocou template string a premennej s menom.' },
    { id: 'inspect-values', text: 'Vypíš string, number a boolean; opíš, čo každý typ hodnoty znamená.' },
  ],
  'lesson-teach-your-code-to-make-decisions': [
    { id: 'write-a-condition', text: 'Pomocou if a else vypíš, či je číslo kladné, alebo nie.' },
    { id: 'count-with-a-loop', text: 'Napíš for loop, ktorý vypíše čísla od 1 po 5.' },
    { id: 'test-a-boundary', text: 'Vyskúšaj podmienku s nulou a vysvetli, prečo je to dôležitý okrajový prípad.' },
  ],
  'lesson-bundle-steps-into-functions': [
    { id: 'write-double', text: 'Napíš funkciu double(number), ktorá vráti číslo vynásobené dvoma.' },
    { id: 'call-with-inputs', text: 'Zavolaj funkciu s hodnotami 3 a 0; najprv odhadni a potom over výsledky.' },
    { id: 'explain-the-parts', text: 'V kóde označ parameter, argument a návratovú hodnotu (return value).' },
  ],
  'lesson-meet-c-and-c': [
    { id: 'compare-language-runs', text: 'Opíš, ako browser spúšťa JavaScript a ako compiler preloží program v C/C++.' },
    { id: 'first-c-program', text: 'Napíš program v C, ktorý pomocou printf vypíše Hello, world!.' },
    { id: 'first-cpp-program', text: 'Vypíš rovnaký pozdrav v C++ pomocou std::cout a porovnaj oba programy.' },
  ],
  'lesson-types-variables-and-memory': [
    { id: 'declare-values', text: 'V malom C++ programe deklaruj premenné int, char a bool.' },
    { id: 'match-types', text: 'Vyber vhodný type pre vek v celých rokoch a pre desatinné meranie.' },
    { id: 'explain-types', text: 'Vysvetli, ako deklarovaný type pomáha compileru porozumieť hodnote.' },
  ],
  'lesson-keep-related-data-together': [
    { id: 'make-a-collection', text: 'Vytvor C array alebo C++ vector aspoň so štyrmi bodovými hodnotami.' },
    { id: 'loop-through-items', text: 'Pomocou loop prejdi všetky hodnoty a vypočítaj ich súčet.' },
    { id: 'check-indexes', text: 'Vypíš prvú položku a vysvetli, prečo má index 0.' },
  ],
  'lesson-debug-test-and-keep-improving': [
    { id: 'make-a-small-bug', text: 'Urob malý preklep, spusti program a prečítaj prvú error message.' },
    { id: 'test-normal-and-edge', text: 'Otestuj bežný vstup, nulu alebo prázdny vstup a neočakávaný vstup.' },
    { id: 'write-a-test-example', text: 'Pred spustením kódu si zapíš jeden vstup a očakávaný výstup.' },
  ],
  'lesson-write-code-thoughtfully': [
    { id: 'replace-vague-names', text: 'Premenuj nejasné názvy ako x alebo data na názvy, ktoré vysvetľujú ich význam.' },
    { id: 'plan-before-coding', text: 'Napíš pseudokód pre malú úlohu ešte predtým, než začneš písať syntax konkrétneho jazyka.' },
    { id: 'test-edge-cases', text: 'Navrhni bežný aj neobvyklý vstup a opíš očakávaný výsledok pre oba.' },
  ],
};

const additionalLessonTasks = {
  'lesson-how-does-the-web-work': [
    'Vysvetli rozdiel medzi webovou adresou, doménou a konkrétnou stránkou.',
    'Zapíš, aké informácie môže browser poslať serveru v HTTP requeste.',
    'Uveď tri druhy súborov, ktoré môže server poslať v HTTP response.',
    'Nakresli cestu požiadavky na obrázok a jeho zobrazenie v stránke.',
    'Vysvetli, čo browser vytvorí z HTML pred vykreslením stránky.',
    'Opíš, v akom poradí sa pri načítaní stránky využívajú HTML a CSS.',
    'Zisti v developer tools, ktoré súbory sa načítali pri otvorení stránky.',
    'Vysvetli rozdiel medzi odpoveďou 200 a chybou 404.',
    'Uveď, prečo je HTTPS dôležité pri odosielaní prihlasovacích údajov.',
    'Porovnaj prvé načítanie stránky s jej opätovným načítaním z cache.',
    'Opíš, ako JavaScript môže zmeniť stránku po jej prvom vykreslení.',
    'Vysvetli, čo sa stane, ak server neodpovie alebo je bez internetu.',
  ],
  'lesson-give-a-page-its-structure': [
    'Vytvor úplný základ HTML dokumentu s doctype, head, title a body.',
    'Usporiadaj tri nadpisy h2 a podnadpisy h3 do logickej hierarchie.',
    'Použi main, nav, article a footer na označenie častí jednoduchej stránky.',
    'Vytvor zoznam troch krokov pomocou ol a troch odkazov pomocou ul.',
    'Pridaj odkaz na inú stránku a odkaz na sekciu s vlastným id.',
    'Rozhodni, kedy použiť button a kedy a; stručne zdôvodni výber.',
    'Pridaj obrázok s alt textom, ktorý pomôže človeku, čo obrázok nevidí.',
    'Označ dekoratívny obrázok vhodným prázdnym alt atribútom.',
    'Vytvor formulár s menom, labelom, vstupom a odosielacím tlačidlom.',
    'Pridaj required a vhodný type do vstupu formulára a vyskúšaj ho.',
    'Skontroluj, či každý id na stránke používaš iba raz.',
    'Prejdi svoju stránku klávesnicou a oprav nejasný text odkazov.',
  ],
  'lesson-make-it-look-the-way-you-imagined': [
    'Napíš CSS pravidlo, ktoré vyberie všetky odseky a nastaví im farbu.',
    'Porovnaj class selector .notice s id selectorom #notice na príklade.',
    'Vypočítaj celkovú šírku boxu pri zadanom obsahu, paddingu a bordere.',
    'Uprav padding a margin karty tak, aby text nebol nalepený na okraj.',
    'Vytvor Flexbox navigáciu s rovnomerne rozloženými odkazmi.',
    'Vytvor Grid s tromi stĺpcami a medzerou medzi kartami.',
    'Pridaj media query, ktorá na úzkom displeji zmení tri stĺpce na jeden.',
    'Nastav odlišný stav :hover a :focus-visible pre tlačidlo.',
    'Skontroluj kontrast textu a pozadia a uprav ho pre lepšiu čitateľnosť.',
    'Použi CSS premennú pre farbu a zmeň ju na jednom mieste.',
    'V developer tools vypni jedno pravidlo a sleduj, čo sa zmení.',
    'Otestuj layout pri šírke mobilu aj širokého monitora a zapíš rozdiely.',
  ],
  'lesson-store-and-work-with-information': [
    'Vyber const alebo let pre meno, počítadlo a hodnotu, ktorá sa nemení.',
    'Ulož celé číslo, desatinné číslo, text a true/false do samostatných premenných.',
    'Vypočítaj cenu troch položiek a ulož výsledok do pomenovanej premennej.',
    'Vytvor template string, ktorý spojí meno a počet získaných bodov.',
    'Predpovedz výsledok výrazov 4 + 2 a "4" + 2 a potom ich spusti.',
    'Vysvetli rozdiel medzi == a === na príklade rôznych typov hodnôt.',
    'Použi typeof na kontrolu stringu, number a boolean hodnoty.',
    'Vytvor premennú bez priradenej hodnoty a zisti, akú má hodnotu.',
    'Porovnaj null a undefined vlastnými slovami a vytvor príklad každého.',
    'Oprav nejasné názvy a, b a c na názvy vysvetľujúce ich obsah.',
    'Vypíš hodnotu pred zmenou a po zmene pomocou console.log().',
    'Napíš krátky výpočet skóre a skontroluj výsledok ručne aj v Console.',
  ],
  'lesson-teach-your-code-to-make-decisions': [
    'Pomocou if a else urč, či je číslo kladné, záporné alebo nula.',
    'Nájdi chybu v podmienke, ktorá používa = namiesto ===, a oprav ju.',
    'Vytvor podmienku, ktorá overí, či je vek v zadanom rozsahu.',
    'Použi && na overenie dvoch podmienok a || na alternatívu.',
    'Napíš for loop, ktorý vypíše párne čísla od 2 po 10.',
    'Ku každému opakovaniu loop si zapíš hodnotu počítadla a výstup.',
    'Napíš while loop, ktorý sa zastaví po troch úspešných pokusoch.',
    'Nájdi príčinu nekonečného loopu a ukáž, ktorá hodnota sa nemení.',
    'Uprav hranicu loopu tak, aby vypísal čísla 1, 2, 3 aj 4.',
    'Použi break pri nájdení hľadanej hodnoty v krátkom zozname.',
    'Vyskúšaj podmienku s nulou, záporným číslom a veľkou hodnotou.',
    'Vysvetli, kedy je vhodnejší for loop a kedy while loop.',
  ],
  'lesson-bundle-steps-into-functions': [
    'Napíš function greet(name), ktorá vráti pozdrav pre zadané meno.',
    'Označ parameter pri definícii a argument pri volaní funkcie.',
    'Zavolaj jednu funkciu s tromi rôznymi argumentmi a porovnaj výsledky.',
    'Uprav funkciu tak, aby výsledok vrátila cez return namiesto výpisu.',
    'Napíš funkciu calculateArea(width, height) a otestuj ju.',
    'Premenuj funkciu do slovesa, ktoré jasne vyjadruje jej úlohu.',
    'Rozdeľ dlhý postup na dve malé funkcie s jasnými názvami.',
    'Vysvetli, prečo premenná vytvorená vo funkcii nemusí byť dostupná vonku.',
    'Vytvor funkciu, ktorá skontroluje, či je číslo kladné.',
    'Pridaj parameter s predvolenou hodnotou a otestuj volanie bez argumentu.',
    'Napíš funkciu bez vedľajších účinkov a porovnaj ju s funkciou, ktorá mení skóre.',
    'Na papieri sleduj vstup, return value a miesto, kde sa výsledok použije.',
  ],
  'lesson-meet-c-and-c': [
    'Vysvetli rozdiel medzi zdrojovým kódom a spustiteľným programom.',
    'Pomenuj príponu súboru pre bežný zdrojový kód v C a v C++.',
    'Opíš tri hlavné kroky od úpravy kódu po spustenie programu.',
    'Napíš program v C s main, ktorý vypíše dva riadky textu.',
    'Napíš program v C++ s main, ktorý vypíše rovnaké dva riadky.',
    'Vysvetli, prečo program používa hlavičku stdio.h alebo iostream.',
    'Oprav chýbajúcu bodkočiarku a prečítaj správu compileru.',
    'Porovnaj printf v C so std::cout v C++ na malom príklade.',
    'Zisti, čo znamená return 0 na konci funkcie main.',
    'Rozlíš chybu compileru od chyby, ktorá nastane až počas behu.',
    'Vytvor zdrojový súbor s výpisom mena a skompiluj ho podľa návodu.',
    'Vysvetli, ktoré programátorské pojmy zostávajú rovnaké v oboch jazykoch.',
  ],
  'lesson-types-variables-and-memory': [
    'Deklaruj int pre počet bodov a double pre priemernú hodnotu.',
    'Ulož jeden znak do char a vysvetli rozdiel oproti textovému stringu.',
    'Vytvor bool, ktorý opisuje, či je používateľ prihlásený.',
    'Inicializuj každú premennú ešte pred jej prvým použitím.',
    'Predpovedz výsledok delenia dvoch int hodnôt a porovnaj ho s double.',
    'Preveď desatinnú hodnotu na int a opíš, aká informácia sa stratí.',
    'Nájdi v krátkom príklade nesúlad typu a hodnoty a oprav ho.',
    'Vysvetli, prečo compiler potrebuje vedieť typ premennej.',
    'Použi const pre hodnotu, ktorá sa počas programu nemá zmeniť.',
    'Zisti pomocou sizeof veľkosť vybraného typu vo svojom prostredí.',
    'Vysvetli, prečo neinicializovaná lokálna premenná môže byť nebezpečná.',
    'Vyber vhodný typ pre vek, teplotu, iniciálu a stav dokončenia.',
  ],
  'lesson-keep-related-data-together': [
    'Vytvor pole piatich čísel a vypíš jeho prvú a poslednú položku.',
    'Vypíš každý index a hodnotu, ktorá sa na tomto indexe nachádza.',
    'Spočítaj položky vectoru pomocou range-based for loopu v C++.',
    'Nájdi najvyššiu hodnotu v kolekcii bez použitia hotovej funkcie.',
    'Vyhľadaj konkrétnu hodnotu a vypíš, či sa v zozname nachádza.',
    'Vypočítaj priemer a ošetri prípad, keď je zoznam prázdny.',
    'Oprav loop, ktorý pristupuje o jednu pozíciu za koniec poľa.',
    'Porovnaj pevne veľké pole v C a meniteľný vector v C++.',
    'Zmeň druhú položku a vysvetli, prečo má index 1.',
    'Vytvor kolekciu mien a prejdi ju bez číselného indexu.',
    'Otestuj algoritmus s jednou položkou, viacerými položkami a prázdnym zoznamom.',
    'Rozhodni, či súvisiacich päť hodnôt patrí do samostatných premenných alebo poľa.',
  ],
  'lesson-debug-test-and-keep-improving': [
    'Ku každému príkladu urč, či ide o syntax, runtime alebo logic error.',
    'Zopakuj chybu podľa presných krokov a zapíš vstup, ktorý ju vyvolá.',
    'Prečítaj prvú užitočnú error message a nájdi spomenutý riadok.',
    'Pridaj dočasný console.log() a zisti, akú hodnotu má premenná.',
    'Porovnaj očakávaný a skutočný výsledok jednoduchého výpočtu.',
    'Otestuj funkciu s bežnou hodnotou, nulou a prázdnym vstupom.',
    'Zmeň pri oprave vždy iba jednu vec a po každej zmene test zopakuj.',
    'Vytvor krátky testovací príklad, ktorý odhalí chybnú hranicu loopu.',
    'Po oprave chyby zopakuj aj test, ktorý predtým fungoval.',
    'Použi breakpoint alebo krokovanie a sleduj, ako sa menia premenné.',
    'Zapíš si chybu ako: kroky, očakávané správanie, skutočné správanie.',
    'Vysvetli, prečo testovanie jedného vstupu nestačí na overenie programu.',
  ],
  'lesson-write-code-thoughtfully': [
    'Pred kódovaním opíš vlastnými slovami, aký problém má program vyriešiť.',
    'Vytvor dva príklady vstupu a očakávaného výstupu ešte pred písaním kódu.',
    'Premenuj nejasné premenné tak, aby ich účel pochopil aj spolužiak.',
    'Rozdeľ dlhý postup na menšie kroky a každému priraď jeden účel.',
    'Nájdi opakovaný blok a navrhni, ako ho nahradiť funkciou.',
    'Nahraď nevysvetlené číslo pomenovanou konštantou a objasni jej význam.',
    'Pridaj kontrolu prázdneho alebo nesprávneho vstupu do svojho riešenia.',
    'Vytvor pseudokód na nájdenie najväčšieho čísla v zozname.',
    'Označ v pseudokóde vstup, spracovanie, rozhodnutie a výstup.',
    'Preveď jeden riadok pseudokódu do JavaScriptu alebo C++.',
    'Skontroluj, či komentár vysvetľuje dôvod, nie iba opakuje kód.',
    'Urob malú zmenu, spusti testy a stručne zapíš, čo si sa naučil.',
  ],
};

for (const [lessonId, tasks] of Object.entries(additionalLessonTasks)) {
  lessonTasks[lessonId].push(...tasks.map((text, index) => ({
    id: `practice-${String(index + 4).padStart(2, '0')}`,
    text,
  })));
}

const lessonTaskExamples = {
  'lesson-how-does-the-web-work': [
    'const browser = "server";\nconst server = "browser";',
    'fetch("example.com").then((response) => console.log(response.status));',
    'const html = "style";\nconst css = "content";\nconst javascript = "layout";',
    'const imageUrl = "/images/photo.png";\nfetch("/page.html");',
    'const page = document.querySelector("#missing");\npage.innerHTML = undefined;',
    '<link rel="stylesheet" href="styles.js">\n<script src="styles.css"></script>',
    'fetch("/missing-file.css").then((response) => console.log(response.status));',
    'if (response.status === 404) {\n  console.log("The page loaded successfully");\n}',
    'const loginUrl = "http://example.com/login";',
    'const cacheSeconds = -3600;\nconsole.log("Cache for " + cacheSeconds);',
    'document.querySelector("#missing").textContent = "Welcome";\n// The selector matches no element',
    'fetch("/api/data").then((response) => response.json());\n// Request errors are not handled',
    'const domain = "https://example.com/about";\nconsole.log(domain.split("/")[0]);',
    'fetch("/api/profile").then((response) => console.log(response.body.status));',
    'fetch("/api/data").then((response) => console.log(response.json));',
  ],
  'lesson-give-a-page-its-structure': [
    '<html><head><title>My page</title></head><h1>Hello</h1></html>',
    '<h1>Page</h1>\n<h3>Section</h3>\n<h2>Subsection</h2>',
    '<div class="navigation">Menu</div>\n<div class="main">Article</div>',
    '<ul><li>Prvý krok</li><li>Druhý krok</li><li>Tretí krok</li></ul>',
    '<a href="">Read more</a>\n<section id="details">Details</section>',
    '<a href="#" onclick="saveForm()">Save form</a>',
    '<img src="cat.png">',
    '<img src="divider.png" alt="A decorative divider image that says nothing">',
    '<label>Name</label><input id="name">',
    '<label for="email">Email</label><input id="email" type="text">',
    '<section id="contact">One</section>\n<section id="contact">Two</section>',
    '<a href="/about"></a>',
    '<main><main><h1>Page title</h1></main></main>',
    '<img src="profile.png" alt="image">',
    '<button type="button">\n  <a href="/next">Continue</a>\n</button>',
  ],
  'lesson-make-it-look-the-way-you-imagined': [
    'p { colour: blue; }',
    'notice { color: green; }\n#notice { color: orange; }',
    '.card { width: 200px; padding: 20px; border: 4px solid; }\n/* Celková šírka presahuje 200 px. */',
    '.card { padding: 0; margin: 0; }\n.card p { margin-left: 0; }',
    '.nav { display: block; justify-content: space-between; }',
    '.cards { display: grid; grid-template-columns: repeat(3, 1fr); gap: 0; }',
    '@media (max-width: 600px) {\n  .cards { grid-template-columns: repeat(3, 1fr); }\n}',
    'button:focus { outline: none; }\nbutton:hover { color: #aaa; }',
    '.small-text { color: #ddd; background: #eee; }',
    ':root { --brand: green; }\n.button { color: var(--brand-colour); }',
    '.card { display: flex; }\n.card { display: block; }',
    '.page { width: 1200px; }\n/* Rozloženie sa nezmestí na úzky displej. */',
    '.title { font-size: 12px; }\n.title { font-size: 12; }',
    '.panel { margin: 20px; padding: 0; }\n/* Text touches the border */',
    '.menu { display: grid; grid-template-columns: 1fr 1fr 1fr; }\n/* There are four items */',
  ],
  'lesson-store-and-work-with-information': [
    'const studentName = "Eva";\nstudentName = "Mia";',
    'const age = "16";\nconst isLearning = "true";\nconst height = "1.7";',
    'const firstPrice = 4;\nconst secondPrice = 5;\nconst total = firstPrice - secondPrice;',
    'const name = "Eva";\nconst message = "Hello, ${name}!";',
    'console.log(4 + 2);\nconsole.log("4" + 2);',
    'console.log(5 == "5");',
    'const score = 8;\nconsole.log(typeof scores);',
    'let score;\nconsole.log(score.toFixed(2));',
    'const name = null;\nconsole.log(name.length);',
    'const a = "Eva";\nconst b = 16;\nconst c = true;',
    'let score = 0;\nscore += 1;\nconsole.log(previousScore);',
    'const price = 12;\nconst count = 3;\nconsole.log(price + count);',
    'const message = `Hello, ${userName}!`;\nconst userName = "Eva";',
    'const isReady = "false";\nif (isReady) console.log("Ready");',
    'const total = 10;\nconsole.log(total = 5);',
  ],
  'lesson-teach-your-code-to-make-decisions': [
    'const number = 0;\nif (number > 0) console.log("positive");\nelse console.log("negative");',
    'const score = 10;\nif (score = 10) console.log("Perfect");',
    'const age = 16;\nif (age > 13 || age < 19) console.log("In range");',
    'const hasTicket = true;\nconst isAdult = false;\nif (hasTicket = isAdult) console.log("Enter");',
    'for (let number = 2; number < 10; number += 2) console.log(number);',
    'for (let index = 1; index <= 3; index++) {\n  console.log(index + 1);\n}',
    'let attempts = 0;\nwhile (attempts < 3) {\n  console.log("Try");\n}',
    'let count = 0;\nwhile (count < 5) {\n  console.log(count);\n  count--;\n}',
    'for (let number = 1; number < 4; number++) console.log(number);',
    'const values = [2, 5, 8];\nfor (const value of values) {\n  if (value === 5) continue;\n}\nconsole.log("Found");',
    'const temperature = 0;\nif (temperature < 0) console.log("Freezing");\nelse console.log("Above freezing");',
    'let number = 5;\nwhile (number > 0) {\n  number++;\n}',
    'const points = 4;\nif (points >= 10) console.log("Gold");\nelse if (points >= 5) console.log("Silver");\nelse console.log("Bronze");',
    'const items = [1, 2, 3, 4, 5];\nfor (let i = 0; i <= 5; i++) console.log(items[i]);',
    'const isLoggedIn = false;\nif (isLoggedIn); {\n  console.log("Welcome");\n}',
  ],
  'lesson-bundle-steps-into-functions': [
    'function greet(name) {\n  return "Hello";\n}\nconsole.log(greet("Eva"));',
    'function double(number) {\n  return number * 2;\n}\ndouble();',
    'function add(a, b) {\n  return a + b;\n}\nconsole.log(add(2));',
    'function getTotal(price, count) {\n  console.log(price * count);\n}\nconst total = getTotal(4, 3);',
    'function calculateArea(width, height) {\n  return width + height;\n}',
    'function x(a) {\n  return a * 2;\n}',
    'function showUser() {\n  const name = "Eva";\n  const greeting = "Hello, " + name;\n  console.log(greeting);\n  return greeting.length;\n}',
    'function makeMessage() {\n  const message = "Hello";\n}\nconsole.log(message);',
    'function isPositive(number) {\n  return number >= 0;\n}\nconsole.log(isPositive(-2));',
    'function greet(name = "friend") {\n  return "Hello, " + user;\n}',
    'let score = 0;\nfunction double(number) {\n  score = number * 2;\n}',
    'function multiply(number, factor) {\n  return number + factor;\n}\nconst result = multiply(3, 4);',
    'function subtract(first, second) {\n  return second - first;\n}',
    'const result = calculateArea(3, 4);\nfunction calculateArea(width, height) {\n  return width + height;\n}',
    'function getLength(text) {\n  return text.length;\n}\nconsole.log(getLength());',
  ],
  'lesson-meet-c-and-c': [
    'const char* sourceFile = "app.exe";\nconst char* executableFile = "main.c";',
    'main.c  // C++\nmain.cpp  // C',
    'compile source -> edit source -> run program',
    '#include <stdio.h>\nint main(void) { printf("Hello") return 0; }',
    '#include <iostream>\nint main() { std::cout << "Hello"; return; }',
    '#include <stdio.h>\nint main(void) { std::cout << "Hello"; return 0; }',
    '#include <stdio.h>\nint main(void) { printf("Hello") return 0; }',
    '#include <iostream>\nint main() { printf("Hello"); return 0; }',
    'int main(void) {\n  return 1;\n}',
    'int main() {\n  int result = 4 / 0;\n  return 0;\n}',
    '#include <stdio.h>\nint main(void) {\n  printf("Name: %d\\n", "Eva");\n  return 0;\n}',
    'int add(int first, int second) {\n  return first - second;\n}',
    'int main(void) { printf("Hello\\n"); return 0; }',
    '#include <iostream>\nint main() { std::cout << "Hello" return 0; }',
    'int main() {\n  console.log("Hello");\n  return 0;\n}',
  ],
  'lesson-types-variables-and-memory': [
    'int points = "ten";',
    'char initial = "Eva";\nstd::string name = \'E\';',
    'bool isLoggedIn = "true";',
    'int score;\nstd::cout << score;',
    'int result = 7 / 2;\ndouble average = result;',
    'double height = 1.85;\nint roundedHeight = height;',
    'int age = 16.5;',
    'int count = 3;\ncount = "four";',
    'const int maxAttempts = 3;\nmaxAttempts = 4;',
    'std::cout << "bool: " << sizeof(double) << " bytes\\n";\nstd::cout << "double: " << sizeof(bool) << " bytes\\n";',
    'int value;\nint total = value + 1;',
    'int age = 16;\ndouble temperature = 20;\nchar finished = true;',
    'std::string name = "Eva";\nstd::cout << name[10];',
    'double price = 2.5;\nint count = 3;\nint total = price * count;',
    'int score = 0;\nscore = score + true;',
  ],
  'lesson-keep-related-data-together': [
    'int scores[5] = {2, 4, 6, 8, 10};\nstd::cout << scores[0] << scores[5];',
    'int values[3] = {4, 7, 9};\nfor (int i = 1; i <= 3; i++) std::cout << values[i];',
    'std::vector<int> values = {2, 3, 4};\nint total = 0;\nfor (int value : values) total = value;',
    'std::vector<int> values = {3, 8, 2};\nint largest = 0;\nfor (int value : values) if (value < largest) largest = value;',
    'std::vector<int> values = {1, 5, 7};\nint target = 5;\nbool found = false;\nfor (int value : values) found = (value != target);',
    'std::vector<int> values;\nint average = total / values.size();',
    'int values[3] = {1, 2, 3};\nfor (int i = 0; i <= 3; i++) std::cout << values[i];',
    'int fixedScores[3] = {1, 2, 3};\nfixedScores.push_back(4);',
    'std::vector<int> values = {8, 9, 10};\nvalues[2] = 7;\nstd::cout << values[1];',
    'std::vector<std::string> names = {"Eva", "Mia"};\nfor (int i = 0; i < names.size(); i++) std::cout << names[3];',
    'std::vector<int> values;\nint first = values[0];',
    'int first = 4, second = 6, third = 8, fourth = 10;\nstd::cout << first + second;',
    'std::vector<int> values = {2, 4, 6};\nint total = 0;\nfor (int i = 0; i < values.size(); i++) total += values[i + 1];',
    'std::vector<int> values = {3, 7, 9};\nint target = 7;\nstd::cout << (values[0] == target);',
    'std::vector<int> values = {5};\nstd::cout << values[1];',
  ],
  'lesson-debug-test-and-keep-improving': [
    'const total = 10\nconsole.log(total);',
    'const user = null;\nconsole.log(user.name);',
    'const total = 4 + 5;\nconsole.log(totla);',
    'const score = 7;\nconsole.log(scores);',
    'function add(a, b) { return a - b; }\nconsole.log(add(2, 3));',
    'function average(values) {\n  return values.reduce((a, b) => a + b) / values.length;\n}\nconsole.log(average([]));',
    'let count = 0;\ncount++;\nconsole.log(count);',
    'for (let i = 0; i <= values.length; i++) console.log(values[i]);',
    'function double(number) { return number * 3; }\nconsole.log(double(4));',
    'let total = 0;\nfor (let i = 0; i < 3; i++) total += values[i];\n// Inspect values before the loop runs',
    'const expected = 10;\nconst actual = 8;\nconsole.log(expected === actual);',
    'const dividend = 10;\nconst divisor = 0;\nconsole.log(dividend / divisor);',
    'function getName(user) { return user.name; }\nconsole.log(getName(null));',
    'const message = "Ready";\nconsole.log(mesage);',
    'function isEven(number) { return number % 2 === 1; }\nconsole.log(isEven(4));',
  ],
  'lesson-write-code-thoughtfully': [
    'function calculate(a, b) { return a * b; }\nconsole.log(calculate(2, 3));',
    'const firstInput = 3;\nconst expectedOutput = 6;\nconst actualOutput = firstInput + 1;\nconsole.log(actualOutput === expectedOutput);',
    'let x = 12;\nlet data = 3;\nconsole.log(x / data);',
    'function processOrder(order) {\n  validate(order);\n  calculateTotal(order);\n  save(order);\n  sendEmail(order);\n}',
    'const price = 10;\nconst quantity = 2;\nconst shipping = 3;\nconst subtotal = price * quantity;\nconst total = price * quantity;',
    'const price = 10;\nconst total = price * 1.2;',
    'const input = "0";\nconst age = Number(input);\nconsole.log(100 / age);',
    'const values = [-3, -1, -5];\nlet largest = 0;\nfor (const value of values) {\n  if (value < largest) largest = value;\n}',
    'READ values\nPRINT values\n// No processing step or decision',
    'const total = 12;\nconst count = 3;\nconst average = total + count;\nconsole.log(average);',
    'let total;\ntotal += 5;\nconsole.log(total);',
    'function calculateTotal(items) {\n  let total = 0;\n  for (const item of items) total -= item;\n  return total;\n}\nconst items = [4, 6];\nconsole.log(calculateTotal(items));',
    'const price = 10;\nconst count = 2;\nconsole.log(price - count);',
    'const items = [];\nif (items.length === 0) {\n  console.log("Empty");\n}\nconsole.log(items[0]);',
    'function showScore(score) {\n  return "Score: " + score;\n  console.log("Done");\n}',
  ],
};

const lessonTaskPrompts = {
  'lesson-how-does-the-web-work': [
    'Oprav priradenie: browser má byť "browser" a server má byť "server".',
    'Zmeň adresu v fetch na https://example.com a vypíš stav odpovede.',
    'Oprav hodnoty: HTML je obsah, CSS je vzhľad a JavaScript pridáva správanie.',
    'Uprav fetch tak, aby načítal obrázok z premennej imageUrl, nie stránku.',
    'Vyber nadpis h1 a zmeň jeho text na "Welcome" pomocou textContent.',
    'Prepoj styles.css ako štýl a script.js ako JavaScriptový súbor.',
    'Načítaj existujúci súbor /styles.css a vypíš stav odpovede servera.',
    'Ak je stav 404, vypíš "Stránka sa nenašla", nie správu o úspechu.',
    'Zabezpeč prihlasovaciu adresu: použi https namiesto http.',
    'Nastav platnú dobu cache na 3600 sekúnd.',
    'Vyber existujúci nadpis h1 a nastav mu text "Welcome".',
    'Doplň spracovanie chyby, aby program oznámil, keď request zlyhá.',
    'Z adresy vypíš iba doménu example.com, bez https:// a cesty /about.',
    'Stav odpovede získaj z response.status a vypíš ho.',
    'Zavolaj response.json(), aby si získal dáta z odpovede.',
  ],
  'lesson-give-a-page-its-structure': [
    'Doplň doctype a body; nadpis Hello musí byť vo vnútri body.',
    'Usporiadaj nadpisy: Page je h1, Section je h2 a Subsection je h3.',
    'Označ Menu elementom nav a článok vlož do jedného elementu main.',
    'Zmeň zoznam na tri očíslované kroky pomocou ol.',
    'Prepoj odkaz s časťou stránky cez href="#details".',
    'Keď sa klikne na Save form, má sa spustiť akcia, nie otvoriť stránka. Použi button.',
    'Doplň obrázku alt text "Mačka".',
    'Označ obrázok ako dekoratívny prázdnym alt textom: alt="".',
    'Prepoj popis Name so vstupom pomocou for="name".',
    'Zmeň vstup na e-mailový a povinný: type="email" a required.',
    'Premenuj druhé id na contact-details, aby každé id bolo jedinečné.',
    'Doplň odkaz textom "O nás", aby bolo jasné, kam vedie.',
    'Ponechaj na stránke jeden main a odstráň vnorený main.',
    'Oprav alt text tak, aby opisoval profilovú fotografiu používateľa.',
    'Navigácia má byť odkaz, nie button obsahujúci ďalší odkaz. Uprav elementy.',
  ],
  'lesson-make-it-look-the-way-you-imagined': [
    'Oprav názov CSS vlastnosti, aby všetky odseky mali modrú farbu.',
    'Uprav selektory: .notice vyberá class a #notice vyberá id.',
    'Zachovaj celkovú šírku karty 200 px aj s paddingom a okrajom.',
    'Pridaj karte vnútorný priestor, aby sa text nedotýkal jej okraja.',
    'Zmeň navigáciu na Flexbox a rovnomerne rozdeľ jej odkazy.',
    'Rozdeľ karty do troch stĺpcov a nastav medzi nimi medzeru 12 px.',
    'Na obrazovke užšej než 600 px zobraz karty v jednom stĺpci.',
    'Pri použití klávesnice zobraz okolo tlačidla viditeľný focus rámik.',
    'Zvýš kontrast textu: nastav tmavý text na svetlom pozadí.',
    'Oprav názov premennej vo var() tak, aby sa použila --brand.',
    'Nechaj posledné pravidlo zobrazovať kartu cez Flexbox, nie block.',
    'Uprav šírku stránky tak, aby sa zmestila aj na úzky displej.',
    'Odstráň duplicitné pravidlo a nastav nadpisu platnú veľkosť písma 20 px.',
    'Pridaj karte padding 16 px, aby text nebol nalepený na okraji.',
    'Nastav mriežku na štyri stĺpce, aby mal každý zo štyroch odkazov svoj stĺpec.',
  ],
  'lesson-store-and-work-with-information': [
    'Premenné studentName sa hodnota mení, preto ju deklaruj pomocou let.',
    'Použi čísla pre age a height a skutočnú hodnotu true/false pre isLearning.',
    'Oprav výpočet: cena spolu je 4 + 5, teda 9.',
    'Použi template string, aby sa v správe zobrazilo "Hello, Eva!".',
    'Preveď text "4" na číslo, aby oba výpočty vrátili čísla 6.',
    'Porovnaj hodnoty striktne pomocou ===; výsledok pre 5 a "5" má byť false.',
    'Oprav názov premennej v typeof, aby skontroloval typ score.',
    'Nastav score na 0 pred volaním toFixed(); očakávaný výpis je 0.00.',
    'Nastav name na text "Eva", aby bolo možné vypísať počet písmen.',
    'Premenuj a, b a c na studentName, age a isLearning.',
    'Ulož pôvodné skóre do previousScore a potom vypíš starú aj novú hodnotu.',
    'Vypočítaj celkovú cenu násobením ceny 12 a množstva 3; výsledok je 36.',
    'Deklaruj userName predtým, než ho použiješ v správe.',
    'Ulož isReady ako boolean false, nie ako text "false".',
    'Vypíš, či je total rovné 5, bez toho, aby si zmenil hodnotu total.',
  ],
  'lesson-teach-your-code-to-make-decisions': [
    'Rozlíš tri výsledky: 0 je nula, číslo nad 0 je kladné a pod 0 záporné.',
    'Oprav podmienku tak, aby porovnávala score s 10 pomocou ===.',
    'Vek je v rozsahu od 13 do 19 vrátane; oprav obe hranice aj operátor.',
    'Vstup povoľ iba vtedy, keď má používateľ lístok aj je dospelý.',
    'Uprav hranicu loopu tak, aby vypísal párne čísla 2, 4, 6, 8 a 10.',
    'Uprav loop tak, aby vypísal 1, 2, 3. Prvé vypísané číslo má byť 1.',
    'Zastav while po troch pokusoch tým, že po každom pokuse zvýšiš attempts.',
    'Oprav zmenu count tak, aby sa približoval k 5 a loop sa skončil.',
    'Uprav loop, aby vypísal všetky čísla od 1 po 4 vrátane.',
    'Keď value dosiahne 5, nastav found na true a ukonči hľadanie.',
    'Pri teplote 0 vypíš "Freezing"; oprav podmienku na hranici nuly.',
    'Znižuj number, aby sa while loop od 5 bezpečne skončil.',
    'Nastav hranicu Silver na 4, aby points = 4 vypísalo "Silver".',
    'Vypíš všetkých päť položiek; pole vytvor pred loopom a použi platný index.',
    'Oprav if bez zbytočnej bodkočiarky a nastav isLoggedIn na false.',
  ],
  'lesson-bundle-steps-into-functions': [
    'Uprav greet tak, aby vrátilo "Hello, Eva!" pre meno Eva.',
    'Zavolaj double s hodnotou 4; výsledok má byť 8.',
    'Odovzdaj funkcii add obe čísla 2 a 3; výsledok má byť 5.',
    'Vráť výsledok z getTotal; po zavolaní má byť total rovné 12.',
    'Oprav calculateArea: obsah obdĺžnika so stranami 3 a 4 je 12.',
    'Premenuj funkciu x na double a parameter a na number; nech vráti dvojnásobok.',
    'Uprav showUser tak, aby iba vrátil pozdrav a dĺžku nevypisoval.',
    'Vráť message z funkcie a vypíš ho až po jej zavolaní.',
    'Nula nie je kladné číslo; uprav podmienku a otestuj -2 aj 0.',
    'Použi parameter name aj pri skladaní pozdravu; pri vynechaní vypíš friend.',
    'Uprav double tak, aby vrátil dvojnásobok bez zmeny globálneho score.',
    'Oprav násobenie: multiply(3, 4) má vrátiť 12.',
    'Oprav poradie odčítania: subtract(9, 4) má vrátiť 5.',
    'Uprav funkciu tak, aby calculateArea(3, 4) vrátilo 12.',
    'Odovzdaj getLength text "Eva"; výsledná dĺžka má byť 3.',
  ],
  'lesson-meet-c-and-c': [
    'Pomenuj zdrojový súbor main.c a výsledný program app.exe; nezamieňaj ich.',
    'Oprav prípony: C používa main.c a C++ používa main.cpp.',
    'Usporiadaj kroky správne: uprav zdrojový kód, skompiluj ho, potom spusti program.',
    'Doplň chýbajúcu bodkočiarku za printf, aby sa program v C skompiloval.',
    'Vráť z funkcie main v C++ celé číslo 0.',
    'Použi iostream, aby program v C++ mohol volať std::cout.',
    'Doplň bodkočiarku za printf v programe v C.',
    'Použi std::cout v C++ na výpis textu Hello.',
    'Oprav návratovú hodnotu main na 0, čo označuje úspešné ukončenie.',
    'Oprav delenie nulou; použi nenulový deliteľ 2.',
    'Oprav formát printf tak, aby vypísal text Eva pomocou %s.',
    'Oprav funkciu add: pre hodnoty 2 a 3 má vrátiť 5.',
    'Doplň hlavičku stdio.h, ktorú potrebuje funkcia printf v jazyku C.',
    'Doplň bodkočiarku za std::cout, aby sa program v C++ skompiloval.',
    'Nahraď console.log v programe v C++ výpisom Hello cez std::cout.',
  ],
  'lesson-types-variables-and-memory': [
    'Ulož počet bodov ako celé číslo 10, nie ako text "ten".',
    'Použi char pre jeden znak E a std::string pre celé meno Eva.',
    'Ulož isLoggedIn ako boolean true bez úvodzoviek.',
    'Nastav score na 0 predtým, než ho vypíšeš.',
    'Vypočítaj priemer ako desatinné číslo 3.5; zabráň celočíselnému deleniu.',
    'Ulož výšku 1.85 do double, aby sa nestratila desatinná časť.',
    'Vek ulož ako celé číslo 16; odstráň desatinnú časť zo zadanej hodnoty.',
    'Oprav priradenie: count má byť číslo 4, nie text "four".',
    'Ak sa maxAttempts mení z 3 na 4, deklaruj ju pomocou let, nie const.',
    'Oprav priradenie veľkostí: boolSize má používať sizeof(bool) a doubleSize sizeof(double).',
    'Inicializuj value na 0 pred výpočtom total.',
    'Použi bool pre finished, double pre temperature a int pre age.',
    'Vypíš prvý znak mena Eva pomocou indexu 0.',
    'Ulož výsledok násobenia 2.5 a 3 do double, aby zostala desatinná časť.',
    'Pripočítaj k score číslo 1, nie hodnotu true.',
  ],
  'lesson-keep-related-data-together': [
    'Vypíš prvý aj posledný výsledok; posledný prvok má index 4, nie 5.',
    'Prejdi všetky tri čísla od indexu 0 po 2 a každé vypíš.',
    'Pripočítavaj každú hodnotu do total; súčet 2, 3 a 4 má byť 9.',
    'Nájdi najväčšie číslo v zozname 3, 8, 2; správny výsledok je 8.',
    'Nastav found na true iba vtedy, keď sa hodnota rovná target 5.',
    'Vypočítaj priemer čísel 2, 4 a 6; pred delením skontroluj prázdny zoznam.',
    'Prejdi tri položky poľa bez prístupu za jeho koniec.',
    'Použi vector, aby si mohol pridať štvrté skóre pomocou push_back.',
    'Zmeň druhú položku na 7 a vypíš ju; druhá položka má index 1.',
    'Vypíš každé meno cez names[i], nie cez neplatný index 3.',
    'Pred čítaním prvej položky skontroluj, či zoznam nie je prázdny.',
    'Spočítaj všetky štyri hodnoty 4, 6, 8 a 10 pomocou poľa a loopu.',
    'Pripočítaj každú položku poľa; správny súčet 2, 4 a 6 je 12.',
    'Prejdi celý zoznam a zisti, či obsahuje číslo 7.',
    'Pri zozname s jedným číslom vypíš values[0], nie neexistujúci values[1].',
  ],
  'lesson-debug-test-and-keep-improving': [
    'Oprav syntaktickú chybu a nechaj program vypísať total = 10.',
    'Ošetri user = null; program má vypísať "Neznámy používateľ", nie spadnúť.',
    'Oprav preklep v názve premennej; vypísaný súčet má byť 9.',
    'Oprav názov tak, aby sa vypísalo score = 7.',
    'Oprav funkciu add; výsledok sčítania 2 a 3 má byť 5.',
    'Ošetri prázdny zoznam a vypočítaj priemer hodnôt 2, 4, 6 ako 4.',
    'Zmeň iba chybný riadok a nechaj count skončiť na hodnote 2.',
    'Oprav hranicu loopu tak, aby čítal len platné indexy poľa.',
    'Oprav funkciu double; pre vstup 4 má vrátiť 8.',
    'Deklaruj values = [2, 4, 6] a vypočítaj ich súčet pomocou loopu.',
    'Zmeň actual na správny výsledok 10, aby porovnanie s expected platilo.',
    'Ošetri delenie nulou a otestuj výpočet s bežným aj nulovým vstupom.',
    'Ošetri null; getName(null) má vrátiť text "Neznáme meno".',
    'Oprav preklep a vypíš text "Ready".',
    'Oprav isEven tak, aby pre číslo 4 vrátil true.',
  ],
  'lesson-write-code-thoughtfully': [
    'Oprav výpočet sumy: calculate(2, 3) má vrátiť 5, nie súčin.',
    'Pre číslo 3 vypočítaj dvojnásobok 6 a nastav rovnaký očakávaný výsledok.',
    'Premenuj x na total a data na itemCount; výsledok delenia má byť 4.',
    'Uprav processOrder tak, aby len skontrolovala objednávku a vrátila cenu. Ukladanie a e-mail nech rieši iná časť programu.',
    'Vypočítaj subtotal z price a quantity a potom k nemu pripočítaj shipping.',
    'Nahraď číslo 1.2 pomenovanou konštantou, napríklad taxMultiplier.',
    'Pred delením skontroluj, že input je platné kladné číslo; pri chybe vypíš správu.',
    'Nájdi najväčšiu hodnotu v values = [-3, -1, -5]; výsledok má byť -1.',
    'Doplň pseudokód, ktorý spočíta values a vypíše priemer; ošetri prázdny zoznam.',
    'Vypočítaj priemer total = 12 a count = 3 pomocou delenia; výsledok má byť 4.',
    'Inicializuj total na 0 predtým, než k nemu pripočítaš hodnotu 5.',
    'Otestuj calculateTotal na položkách 4 a 6; porovnaj výsledok s očakávanou hodnotou 10.',
    'Oprav výpočet: cena 10 krát počet 2 má dať celkovú cenu 20.',
    'Ak je items prázdne, vypíš Empty; inak bezpečne vypíš prvú položku.',
    'Presuň výpis Done pred return, aby sa vykonali oba kroky.',
  ],
};

for (const [lessonId, tasks] of Object.entries(lessonTasks)) {
  tasks.forEach((task, index) => {
    task.text = lessonTaskPrompts[lessonId][index];
    task.example = lessonTaskExamples[lessonId][index];
  });
}

const lessonContent = {
  'lesson-how-does-the-web-work': {
    intro: 'Webová stránka sa zobrazí vtedy, keď si browser vyžiada súbory od servera a potom ich spracuje.',
    explanation: 'Predstav si knižnicu: browser je čitateľ, ktorý požiada o knihu; server je knižnica, ktorá ju nájde a pošle späť. V skutočnosti browser pošle HTTP request na adresu servera. Server odpovie HTTP response, napríklad súbormi HTML, CSS, JavaScript a obrázkami. Browser z HTML vytvorí DOM, podľa CSS stránku vykreslí a spustí JavaScript.',
    points: [
      'HTML hovorí, aký obsah a význam stránka má.',
      'CSS určuje vzhľad a rozloženie stránky.',
      'JavaScript pridáva správanie a reakcie na udalosti.',
    ],
    examples: [{ label: 'Cesta webovej stránky', code: 'Browser ── HTTP request ──> Server\nBrowser <── HTTP response ── Server\nHTML + CSS + JavaScript ──> vykreslená stránka' }],
    takeaway: 'Browser zobrazuje stránku, server posiela jej súbory a HTTP request/response umožňuje ich výmenu.',
  },
  'lesson-give-a-page-its-structure': {
    intro: 'HTML je značenie, ktorým browseru vysvetlíš, čo jednotlivé časti stránky znamenajú.',
    explanation: 'HTML element zvyčajne tvorí otvárací tag, obsah a zatvárací tag. Atribúty poskytujú ďalšie informácie: href určuje cieľ odkazu, src cestu k obrázku a alt jeho textový opis. Používaj elementy podľa ich významu, nie iba podľa toho, ako vyzerajú.',
    points: [
      'Na stránke používaj jeden hlavný h1 a potom nadpisy h2, h3 v logickom poradí.',
      'Elementy main, nav, article a footer dávajú obsahu zrozumiteľnú sémantiku.',
      'Každý odkaz má viesť na zmysluplné miesto; obrázok potrebuje vhodný alt text.',
    ],
    examples: [{ label: 'Sémantická HTML štruktúra', code: '<main>\n  <article>\n    <h1>Môj prvý projekt</h1>\n    <p>Učím sa tvoriť webové stránky.</p>\n    <a href="https://example.com">Ukážka odkazu</a>\n  </article>\n</main>' }],
    takeaway: 'HTML opisuje význam obsahu. Dobrý HTML kód je zrozumiteľný pre browser, človeka aj čítačku obrazovky.',
  },
  'lesson-make-it-look-the-way-you-imagined': {
    intro: 'CSS mení vzhľad HTML elementov: ich farbu, veľkosť, rozostupy aj polohu na stránke.',
    explanation: 'CSS rule sa skladá zo selectoru a bloku deklarácií. Selector vyberie elementy, declarations sú dvojice property a value. Každý element sa správa ako box: obsah, padding, border a margin. Na rozloženie používaj Flexbox pre jeden smer a Grid pre riadky aj stĺpce. Media query upraví vzhľad podľa šírky obrazovky.',
    points: [
      'Selector p vyberie všetky odseky; .card vyberie elementy s class="card".',
      'Padding je vnútorný priestor; margin je priestor mimo borderu.',
      'Začni jednoduchým rozložením a pridaj media query pre úzke obrazovky.',
    ],
    examples: [{ label: 'CSS selector a responzívny layout', code: '.card {\n  padding: 16px;\n  border: 1px solid #ccd;\n}\n\n.cards {\n  display: grid;\n  grid-template-columns: repeat(2, 1fr);\n  gap: 12px;\n}\n\n@media (max-width: 600px) {\n  .cards { grid-template-columns: 1fr; }\n}' }],
    takeaway: 'CSS rule vyberie elementy pomocou selectoru a nastaví im vzhľad cez declarations.',
  },
  'lesson-store-and-work-with-information': {
    intro: 'Variable je pomenované miesto, v ktorom program uchováva hodnotu, aby ju mohol neskôr použiť.',
    explanation: 'JavaScript má viacero typov hodnôt. String je text, number je číslo a boolean je true alebo false. Použi const, ak premennú nebudeš znovu priraďovať; let použi, ak sa jej hodnota bude meniť. Operátory ako +, -, * a / počítajú. === porovnáva hodnoty bez automatického prevodu typu.',
    points: [
      'Názov premennej nech jasne vysvetľuje jej obsah, napríklad studentName.',
      'const zakazuje opätovné priradenie premennej; nemení však automaticky obsah objektu alebo poľa.',
      'Na kontrolu hodnoty použi console.log() a sleduj Console v developer tools.',
    ],
    examples: [{ label: 'Premenné, typy a výpis do Console', code: 'const studentName = "Eva";\nlet score = 0;\nscore = score + 1;\n\nconst message = `Ahoj, ${studentName}!`;\nconsole.log(message, score);' }],
    takeaway: 'Premenná má názov a hodnotu. Vyber const alebo let podľa toho, či chceš premennú znovu priradiť.',
  },
  'lesson-teach-your-code-to-make-decisions': {
    intro: 'Condition rozhodne, ktorú časť programu spustiť; loop zopakuje rovnaké kroky viackrát.',
    explanation: 'Výraz v if sa vyhodnotí ako boolean: true alebo false. else sa spustí, keď podmienka neplatí. Operátory >=, <, === a !== porovnávajú hodnoty. for loop sa hodí, keď poznáš počet opakovaní; while loop pokračuje, kým podmienka platí. Pri loop si dávaj pozor na nekonečné opakovanie a hranice indexov.',
    points: [
      'Používaj zložené zátvorky aj pri krátkom if bloku, aby bol kód prehľadný.',
      'V každom loop musí existovať spôsob, ako sa podmienka časom zmení na false.',
      'Operátor === kontroluje rovnosť; = priraďuje hodnotu do premennej.',
    ],
    examples: [{ label: 'Condition a počítací for loop', code: 'const points = 7;\nif (points >= 5) {\n  console.log("Úspech");\n} else {\n  console.log("Skús to znova");\n}\n\nfor (let number = 1; number <= 5; number++) {\n  console.log(number);\n}' }],
    takeaway: 'if/else vyberá vetvu programu. Loop opakuje kroky, kým sa splní jeho pravidlo.',
  },
  'lesson-bundle-steps-into-functions': {
    intro: 'Function je pomenovaný blok kódu, ktorý vykoná jednu úlohu a môžeš ho opakovane zavolať.',
    explanation: 'Function môže dostať vstupy cez parameters. Pri jej zavolaní odovzdávaš konkrétne arguments. return odošle výsledok späť tomu, kto function zavolal. Premenná vytvorená vo vnútri function má zvyčajne lokálny scope a zvonka nie je priamo dostupná. Rozdeľuj program na malé functions s jednou jasnou zodpovednosťou.',
    points: [
      'Parameter je názov vstupu v definícii function; argument je skutočná hodnota pri volaní.',
      'return ukončí function a odovzdá výslednú hodnotu.',
      'Ak function iba vypisuje text, nemusí vracať hodnotu; výpis a výpočet sú odlišné úlohy.',
    ],
    examples: [{ label: 'Function s parameter a return value', code: 'function double(number) {\n  return number * 2;\n}\n\nconst result = double(4);\nconsole.log(result); // 8' }],
    takeaway: 'Function zabalí kroky do znovupoužiteľného bloku. Vstup dostane cez parameter a výsledok vráti pomocou return.',
  },
  'lesson-meet-c-and-c': {
    intro: 'C a C++ sú compiled programming languages: compiler preloží zdrojový kód na program, ktorý počítač spustí.',
    explanation: 'V JavaScript môže kód spustiť browser alebo iný JavaScript runtime. Pri C a C++ najprv uložíš zdrojový kód do súboru, napríklad main.c alebo main.cpp, a compiler ho preloží. Program sa zvyčajne začína vo function main. C má menšiu štandardnú knižnicu; C++ pridáva nástroje ako string a vector. Obe jazyky sa používajú tam, kde je dôležitý výkon alebo priama kontrola nad systémom.',
    points: [
      'Compiler odhalí veľa chýb ešte pred spustením programu.',
      'C používa printf z hlavičky stdio.h; C++ často používa std::cout z iostream.',
      'Začni jednoduchými programami v konzole; zatiaľ nemusíš spravovať pamäť ručne.',
    ],
    examples: [
      { label: 'C — main.c', code: '#include <stdio.h>\n\nint main(void) {\n  printf("Ahoj, svet!\\n");\n  return 0;\n}' },
      { label: 'C++ — main.cpp', code: '#include <iostream>\n\nint main() {\n  std::cout << "Ahoj, svet!\\n";\n  return 0;\n}' },
    ],
    takeaway: 'C aj C++ sa typicky prekladajú compilerom. Základné pojmy ako variable, condition, loop a function zostávajú podobné.',
  },
  'lesson-types-variables-and-memory': {
    intro: 'V C a C++ pri deklarácii premennej určíš jej type, teda aký druh hodnoty bude obsahovať.',
    explanation: 'Type pomáha compileru kontrolovať operácie a určuje, koľko priestoru hodnota potrebuje. int sa používa na celé čísla, double na desatinné čísla, char na jeden znak a bool na true/false. Premennú inicializuj hneď pri vytvorení, aby si náhodou nepracoval s neurčenou hodnotou. Adresa a pointers sú ďalšia téma; najprv sa nauč bezpečne pracovať s obyčajnými premennými.',
    points: [
      'Deklarácia spája type a názov, napríklad int age = 16;.',
      'V C++ môže auto odvodiť type z pravej strany, ale na začiatku je dobré rozumieť explicitným typom.',
      'C++ štandardné kontajnery ako std::string a std::vector sú vhodnejšie pre začiatočníkov než ručná správa pamäte.',
    ],
    examples: [{ label: 'Typované premenné v C++', code: '#include <string>\n\nint age = 16;\ndouble height = 1.68;\nchar initial = \'E\';\nbool isLearning = true;\nstd::string name = "Eva";' }],
    takeaway: 'Type hovorí compileru, aký druh hodnoty premenná obsahuje a aké operácie s ňou dávajú zmysel.',
  },
  'lesson-keep-related-data-together': {
    intro: 'Array alebo collection uchováva viacero hodnôt pod jedným názvom a umožní spracovať ich pomocou loop.',
    explanation: 'Položky v array majú indexy, ktoré začínajú od nuly. Pri štyroch položkách sú indexy 0, 1, 2 a 3, takže posledný index je počet položiek mínus jeden. V C má bežný array pevnú veľkosť. V C++ sa často používa std::vector, ktorý môže meniť svoju veľkosť. Prístup mimo platného rozsahu je chyba, preto si stráž podmienku loop.',
    points: [
      'Index 0 označuje prvú položku, nie druhú.',
      'C++ std::vector poskytuje size() a bezpečnejšie, pohodlnejšie operácie s kolekciou.',
      'Súčet hodnôt môžeš vytvoriť tak, že začneš od 0 a každú položku pridáš v loop.',
    ],
    examples: [{ label: 'Prejdenie C++ vector pomocou range-based for', code: '#include <vector>\n\nstd::vector<int> scores = {8, 6, 10};\nint total = 0;\nfor (int score : scores) {\n  total += score;\n}\n// total má hodnotu 24' }],
    takeaway: 'Collection drží súvisiace hodnoty pokope. Pri práci s indexmi pamätaj, že prvý index je 0.',
  },
  'lesson-debug-test-and-keep-improving': {
    intro: 'Debugging je systematické hľadanie príčiny problému; testovanie overuje, či program funguje aj pri rôznych vstupoch.',
    explanation: 'Syntax error znamená, že kód porušuje pravidlá jazyka. Runtime error nastane počas behu. Logic error znamená, že program síce beží, ale počíta nesprávny výsledok. Prečítaj prvú užitočnú error message, reprodukuj problém a skontroluj hodnoty premenných. Potom zmeň jednu vec a test zopakuj.',
    points: [
      'Otestuj bežný prípad aj okrajové prípady, napríklad nulu, prázdny vstup alebo veľmi veľké číslo.',
      'Pred spustením si napíš očakávaný výsledok; potom ho porovnaj so skutočným.',
      'Keď opravíš chybu, zopakuj testy, ktoré predtým fungovali.',
    ],
    examples: [{ label: 'Nájdi a oprav preklep', code: 'const total = 10;\nconsole.log(totla); // ReferenceError: nesprávny názov\nconsole.log(total); // správne: 10' }],
    takeaway: 'Chyby sú bežnou súčasťou programovania. Postupuj po malých krokoch, testuj a používaj error message ako nápovedu.',
  },
  'lesson-write-code-thoughtfully': {
    intro: 'Programovanie nie je súťaž v písaní čo najväčšieho množstva kódu. Najprv si ujasni problém a potom vytvor najjednoduchšie riešenie, ktorému vieš dôverovať.',
    explanation: 'Vyhni sa nejasným názvom, kopírovaniu rovnakého bloku na viaceré miesta, obrovským funkciám a číslam bez vysvetlenia. Nepredpokladaj, že vstup bude vždy správny, a netestuj iba jeden šťastný prípad. Namiesto toho rozdeľ problém na malé kroky, pomenuj hodnoty podľa ich účelu, používaj funkcie na opakované úlohy a overuj aj prázdne či hraničné vstupy. Pseudokód opisuje logiku obyčajnými slovami bez pravidiel konkrétneho programovacieho jazyka.',
    points: [
      'Nerob všetko naraz: pridaj malú zmenu, spusti program a skontroluj výsledok.',
      'Nekopíruj kód bez porozumenia a neopakuj rovnaké kroky, ak ich môžeš pomenovať funkciou.',
      'Neignoruj chybové hlásenia ani neobvyklé vstupy; sú dôležitou súčasťou správneho riešenia.',
    ],
    examples: [{ label: 'Pseudokód: bezpečný priemer známok', code: 'NAČÍTAJ zoznam známok\nAK je zoznam prázdny:\n  VYPÍŠ "Nie sú zadané žiadne známky"\nINAK:\n  nastav súčet na 0\n  PRE KAŽDÚ známku v zozname:\n    pripočítaj známku k súčtu\n  vypočítaj priemer = súčet / počet známok\n  VYPÍŠ priemer' }],
    takeaway: 'Najprv si naplánuj riešenie, píš zrozumiteľný kód a overuj aj prípady, ktoré nie sú úplne bežné.',
  },
};

const lessonReading = {
  'lesson-how-does-the-web-work': [
    { title: 'Adresa a server', text: 'Keď zadáš webovú adresu, browser najprv potrebuje zistiť, ku ktorému serveru sa má pripojiť. Názov domény, napríklad example.com, sa pomocou systému DNS preloží na sieťovú adresu servera. Potom browser nadviaže spojenie a pošle požiadavku. Doména je ľahko zapamätateľné meno; sama osebe nie je celá stránka. Za lomkou v adrese môže byť cesta ku konkrétnej stránke alebo súboru, napríklad /galeria/foto.jpg.' },
    { title: 'Request a response', text: 'HTTP request je správa od browsera serveru. Môže obsahovať metódu, cestu a ďalšie údaje. Metóda GET zvyčajne žiada o načítanie obsahu; POST často odosiela údaje, napríklad formulár. Server spracuje požiadavku a vráti HTTP response so stavovým kódom a obsahom. Kód 200 znamená úspech, 404 hovorí, že požadovaný zdroj nebol nájdený, a chyba 500 označuje problém na serveri. Chybový kód je informácia, nie opis celej príčiny.' },
    { title: 'Ako vznikne zobrazená stránka', text: 'Server často pošle HTML dokument. Browser z neho postupne vytvorí DOM, teda strom elementov, s ktorým môžu pracovať štýly aj JavaScript. Pri čítaní HTML browser nájde odkazy na CSS, JavaScript, obrázky a fonty a môže si vyžiadať ďalšie súbory. CSS určuje, ako sa elementy zobrazia; JavaScript môže reagovať na udalosti a meniť DOM. Preto jedna webová stránka môže vyžadovať viacero requestov, nie iba jeden.' },
    { title: 'Internet, cache a bezpečnosť', text: 'Internet prenáša dáta medzi zariadeniami cez mnoho vzájomne prepojených sietí. HTTPS chráni spojenie šifrovaním, takže iné zariadenie po ceste nemôže jednoducho prečítať alebo meniť odosielané údaje. Cache je dočasná miestna kópia niektorých súborov. Vďaka nej sa stránka môže načítať rýchlejšie pri ďalšej návšteve, no niekedy treba obnoviť stránku, aby browser získal novšiu verziu. Cache nie je server a neukladá automaticky všetko.' },
    { title: 'Ako hľadať problém', text: 'Ak sa stránka nezobrazí správne, postupuj po vrstvách. Najprv skontroluj adresu a pripojenie, potom stav odpovede v developer tools. V paneli Network môžeš vidieť načítané súbory a ich stavové kódy. V paneli Console sa objavia chyby JavaScriptu. Ak sa načíta HTML, ale chýba obrázok, problém môže byť v jeho ceste alebo odpovedi servera. Rozdelenie problému na request, response, súbory a vykreslenie uľahčuje hľadanie príčiny.' },
  ],
  'lesson-give-a-page-its-structure': [
    { title: 'Dokument a elementy', text: 'HTML dokument má základnú kostru: doctype, koreňový html element, head s informáciami o dokumente a body s obsahom stránky. Element zvyčajne tvorí otvárací tag, obsah a zatvárací tag. Niektoré elementy, napríklad img, nemajú vnútorný text. Tagy píš presne a správne ich vnáraj. Chybne uzavreté elementy môžu spôsobiť, že browser obsah zobrazí inak, než očakávaš. Elementy opisujú význam a štruktúru; vzhľad neskôr upraví CSS.' },
    { title: 'Nadpisy a sémantika', text: 'Nadpisy pomáhajú rozdeliť článok na témy. Hlavná téma stránky má obvykle h1 a ďalšie časti používajú h2, prípadne h3. Vyberaj úroveň podľa hierarchie, nie podľa veľkosti písma; veľkosť nastavíš v CSS. Elementy main, nav, article, section a footer pomenúvajú účel časti stránky. Sémantické HTML je čitateľnejšie pre ďalšieho programátora a pomáha asistenčným technológiám pochopiť, kde sa nachádza hlavný obsah alebo navigácia.' },
    { title: 'Odkazy, obrázky a formuláre', text: 'Element a vytvára odkaz a jeho href určuje cieľ. Text odkazu nech jasne povie, kam vedie; samotné „klikni sem“ bez kontextu je horšie pri čítaní mimo okolia. Obrázok img potrebuje src a zmysluplný alt opis, ak jeho obsah prináša informáciu. Pri dekoratívnom obrázku môže byť alt prázdny. Formulár spája vstupy s labelmi, aby bolo jasné, čo má človek vyplniť. Na akciu používaj button, na navigáciu a.' },
    { title: 'Prístupnosť a ovládanie', text: 'Stránka má fungovať aj bez myši. Odkazy a tlačidlá musia byť dosiahnuteľné klávesnicou a ich poradie má dávať zmysel. Label formulára prepoj s konkrétnym inputom; tým sa zväčší klikateľná plocha a čítačka oznámi názov poľa. Nepoužívaj nadpis iba preto, že má predvolený veľký text. Správny element poskytuje význam aj používateľom, ktorí stránku nevidia, a zvyčajne sa ľahšie ovláda na rôznych zariadeniach.' },
    { title: 'Kontrola výsledku', text: 'Pri písaní si pravidelne otvor stránku v browseri a skontroluj nielen vzhľad, ale aj správanie. Klikni na každý odkaz, prejdi formulár a skontroluj, či sa text dá čítať v správnom poradí. Developer tools zobrazia vytvorený DOM, ktorý môže odhaliť chýbajúci element alebo nesprávne vnorenie. Validátor HTML pomáha nájsť syntaktické problémy, ale nerozhodne za teba, či je obsah užitočný alebo či je alt text skutočne výstižný.' },
  ],
  'lesson-make-it-look-the-way-you-imagined': [
    { title: 'Pravidlá a kaskáda', text: 'CSS pravidlo má selector a blok deklarácií. Selector určuje, ktoré elementy sa zmenia; deklarácia spája vlastnosť s hodnotou, napríklad color s názvom farby. Na jeden element môže platiť viac pravidiel. Kaskáda rozhoduje, ktoré vyhrá, podľa dôležitosti, specificity a poradia. Začni jednoduchými selektormi a rovnakú vlastnosť nenastavuj na mnohých miestach bez dôvodu. Ak sa štýl neuplatní, v developer tools uvidíš pravidlá aj tie, ktoré boli prekonané.' },
    { title: 'Box model a rozostupy', text: 'Každý element sa pri rozložení správa ako box. Obsah je obklopený paddingom, za ním je border a mimo neho margin. Padding zväčšuje priestor vo vnútri okraja; margin oddeľuje box od susedov. Pri počítaní šírky záleží na box-sizing. S border-box sa deklarovaná šírka zahŕňa aj padding a border, čo uľahčuje predvídateľný layout. Použi primeraný priestor a kontroluj skutočné rozmery v inspector paneli.' },
    { title: 'Flexbox a Grid', text: 'Flexbox pomáha rozložiť obsah v jednom smere, napríklad vodorovnú navigáciu alebo stĺpec tlačidiel. Grid sa hodí, keď potrebuješ riadky aj stĺpce, napríklad mriežku kariet. V oboch prípadoch nastav medzery cez gap namiesto množstva ručných okrajov. Neumiestňuj všetko absolútne; taký prvok sa môže prekryť s ostatným obsahom, keď sa zmení šírka alebo množstvo textu. Vyber nástroj podľa tvaru rozloženia, nie podľa náhodného príkladu.' },
    { title: 'Responzivita a čitateľnosť', text: 'Responzívny dizajn prispôsobí stránku rôznym šírkam. Začni rozložením, ktoré funguje na úzkej obrazovke, a potom pridaj priestor pre širšie displeje. Media query mení pravidlá, keď platí podmienka, napríklad šírka pod určitú hranicu. Používaj pružné rozmery a nechaj text zalamovať. Skontroluj kontrast, veľkosť písma a stav focus pre klávesnicu. Dobre vyzerajúca stránka nie je úspešná, ak sa jej obsah na mobile nedá prečítať.' },
    { title: 'Ladenie štýlov', text: 'Ak sa prvok zobrazuje nesprávne, upravuj vždy jednu vlastnosť a pozeraj sa na výsledok. Inspector umožní dočasne vypnúť deklaráciu, zmeniť hodnotu a zistiť, ktoré pravidlo ovplyvňuje prvok. Chyby často spôsobí nesprávny selector, prepísané pravidlo alebo box s inými rozmermi, než si predstavuješ. Vyskúšaj stránku pri viacerých šírkach a s dlhším textom. Tak odhalíš rozloženie, ktoré fungovalo iba pre jediný krátky príklad.' },
  ],
  'lesson-store-and-work-with-information': [
    { title: 'Premenné a priradenie', text: 'Premenná dá hodnote meno, aby si sa na ňu mohol neskôr odvolať. V JavaScripte použi const, keď nebudeš meniť priradenie, a let, keď potrebuješ uložiť novú hodnotu. const neznamená, že obsah objektu alebo poľa sa nikdy nemôže zmeniť; obmedzuje opätovné priradenie samotnej premennej. Vyhni sa var, kým sa učíš základy, pretože jeho pravidlá scope sú odlišné a môžu začiatočníka miasť.' },
    { title: 'Typy hodnôt', text: 'String predstavuje text, number číslo a boolean jednu z dvoch hodnôt true alebo false. JavaScript má aj undefined pre nepriradenú hodnotu a null, ktorým programátor často vyjadruje zámerne prázdnu hodnotu. Typ ovplyvňuje, čo operátor urobí. Sčítanie dvoch čísel počíta, ale spojenie textu s číslom môže vytvoriť nový text. Keď si výsledkom nie si istý, vypíš hodnoty aj ich typy pomocou console.log a typeof.' },
    { title: 'Výrazy a porovnávanie', text: 'Operátory +, -, * a / vytvárajú číselné výsledky. Zátvorky objasňujú poradie operácií a uľahčujú kontrolu výpočtu. Rovnosť porovnávaj pomocou ===, ktorá neprevádza automaticky typy; != a == sa preto začiatočníkom ľahšie používajú nesprávne. Operátor = hodnotu priraďuje, zatiaľ čo === vracia true alebo false. Názvy premenných majú vystihovať ich význam, napríklad studentName alebo totalPrice, aby výpočet zostal čitateľný.' },
    { title: 'Text a skladanie údajov', text: 'Text môžeš spojiť pomocou +, ale pri skladaní viet je čitateľný template string s opačnými apostrofmi. Hodnotu vložíš zápisom ${name}. Takéto skladanie sa hodí napríklad na pozdrav alebo správu o výsledku. Dávaj pozor na medzery a na to, či do správy vkladáš správnu premennú. Ak sa zobrazí undefined, skontroluj názov a miesto, kde bola hodnota vytvorená. Názvy premenných rozlišujú veľké a malé písmená.' },
    { title: 'Ako premýšľať o údajoch', text: 'Pred výpočtom si zapíš, aké údaje potrebuješ, odkiaľ prichádzajú a aký výsledok očakávaš. Napríklad pri cene objednávky potrebuješ cenu jednej položky, množstvo a výslednú sumu. Skontroluj malý príklad ručne a potom porovnaj s programom. Chybu hľadaj sledovaním hodnôt po jednotlivých riadkoch, nie náhodným prepisovaním kódu. Pri údajoch od používateľa pamätaj, že text z inputu nemusí byť automaticky číselnou hodnotou.' },
  ],
  'lesson-teach-your-code-to-make-decisions': [
    { title: 'Podmienky a pravdivostné hodnoty', text: 'Podmienka je výraz, ktorého výsledok je true alebo false. if spustí svoj blok iba vtedy, keď je výsledok true; else poskytuje inú cestu. Porovnávacie operátory ako <, >=, === a !== pomáhajú opísať pravidlo. Rozlišuj priradenie = od porovnania ===. Pri zložitejšom pravidle pomôžu && pre súčasnú platnosť dvoch podmienok a || pre situáciu, keď stačí jedna. Zátvorky môžu spriehľadniť poradie vyhodnocovania.' },
    { title: 'Viacero možností', text: 'Ak existuje viac než dva výsledky, môžeš použiť viacero vetiev else if, ale podmienky usporiadaj od najšpecifickejšej alebo najvyššej hranice. Ak sa vetvy prekrývajú, skoršia môže zachytiť hodnotu skôr, než sa program dostane k neskoršej. Pri kategorizácii bodov napríklad najprv over najvyššie pásmo a potom nižšie. Vyskúšaj hodnoty presne na hraniciach. Nula, najmenšia platná hodnota a hodnota tesne nad hranicou často odhalia chybu.' },
    { title: 'Opakovanie pomocou loop', text: 'Loop vykoná blok opakovane. for sa hodí, keď poznáš počet opakovaní alebo potrebuješ prejsť číselné indexy. while pokračuje, kým podmienka zostáva pravdivá. V každom loop si ujasni, čo sa pri každom opakovaní mení a kedy sa cyklus skončí. Ak sa podmienka nikdy nezmení na false, vznikne nekonečný loop. Pri for loop kontroluj začiatočnú hodnotu, hranicu aj zmenu počítadla.' },
    { title: 'Hranice a bezpečné opakovanie', text: 'Pri zozname s piatimi prvkami sú indexy od 0 po 4, nie po 5. Podmienka index < length preto zvyčajne bezpečne prejde všetky prvky. Operátor <= môže vytvoriť prístup o jednu pozíciu za koniec. Pri while loop je užitočné najprv skontrolovať, či vstup vôbec existuje. Break ukončí cyklus predčasne, no používaj ho len vtedy, keď zjednodušuje riešenie. Nejasné skoky v riadení programu sa ťažšie ladia.' },
    { title: 'Sledovanie programu', text: 'Keď program rozhoduje, vypíš alebo si na papier zapíš hodnotu podmienky a cestu, ktorou pokračuje. Pri loop vytvor tabuľku s číslom opakovania, hodnotou počítadla a výsledkom. Potom otestuj bežný vstup, hranicu, nulu a hodnotu mimo očakávaného rozsahu. Tak uvidíš, či pravidlo opisuje skutočný zámer. Predstav si aj prázdny vstup alebo hodnotu, ktorá nikdy nespĺňa podmienku; pomôže ti to predísť nekonečnému čakaniu.' },
  ],
  'lesson-bundle-steps-into-functions': [
    { title: 'Prečo deliť program na funkcie', text: 'Keď program rastie, jeden dlhý blok je ťažké čítať, testovať aj meniť. Funkcia pomenuje menší postup, napríklad calculateTotal alebo showMessage. Volajúci kód potom môže hovoriť v pojmoch úlohy namiesto opakovania všetkých detailov. Dobrá funkcia má jasný účel a zvyčajne robí jednu vec. Rozdeľuj program podľa zmyslu, nie mechanicky po každom riadku; príliš veľa drobných funkcií môže tok programu zbytočne skryť.' },
    { title: 'Parametre a návratové hodnoty', text: 'Parameter je názov vstupu uvedený v definícii funkcie; argument je konkrétna hodnota odovzdaná pri volaní. return odošle výsledok späť a ukončí funkciu. console.log iba vypíše informáciu do Console, nevracia ju automaticky volajúcemu kódu. Keď chceš výsledok ďalej počítať, vráť ho a ulož do premennej. Premysli si, čo funkcia potrebuje dostať a čo má odovzdať späť.' },
    { title: 'Scope a lokálne hodnoty', text: 'Premenná vytvorená vo vnútri funkcie má blokový scope a zvonka k nej nemusíš mať prístup. To pomáha oddeliť pomocné hodnoty od zvyšku programu. Funkcia by mala svoje vstupy dostávať cez parametre namiesto čítania náhodne zmeniteľného globálneho stavu. Vďaka tomu ju ľahšie pochopíš a otestuješ. Ak funkcia mení globálne hodnoty, súbory alebo stránku, jej vedľajší účinok si všimni a jasne ho pomenuj.' },
    { title: 'Opätovné použitie a malé funkcie', text: 'Ak sa rovnaký postup opakuje, funkcia znižuje počet miest, ktoré musíš pri oprave meniť. Ak však dva bloky iba vyzerajú podobne, no majú iné pravidlá, ich spojenie môže vytvoriť komplikovanú funkciu s množstvom podmienok. Najprv odstráň skutočné opakovanie, ale zachovaj jasný význam. Názov funkcie má vystihovať činnosť. Vstupy a výstupy môžeš opísať krátkou vetou a konkrétnymi príkladmi.' },
    { title: 'Ako funkciu overiť', text: 'Otestuj funkciu aspoň s bežným argumentom a s hraničnou hodnotou, napríklad nulou alebo prázdnym textom. Over návratovú hodnotu, nie iba to, že sa funkcia zavolala. Pri čisto výpočtovej funkcii môžeš výsledok vypočítať ručne a porovnať ho. Ak funkcia vypisuje alebo mení stránku, skontroluj aj tento účinok. Keď chyba vznikne vnútri funkcie, sleduj hodnoty argumentov pri vstupe a návratovú hodnotu pred použitím.' },
  ],
  'lesson-meet-c-and-c': [
    { title: 'Zdrojový kód a preklad', text: 'Zdrojový kód je text, ktorý programátor napíše v jazyku C alebo C++. Počas kompilácie ho nástroje preložia do formy, ktorú počítač dokáže spustiť. Zdrojový súbor má zvyčajne príponu .c alebo .cpp. Výsledný program nie je ten istý súbor ako zdrojový text. Ak zmeníš zdrojový kód, zvyčajne ho musíš znova skompilovať, aby sa zmena prejavila v spustiteľnom programe.' },
    { title: 'Compiler a chyby', text: 'Compiler kontroluje syntax a typy a prekladá zdrojový kód. Ak nájde problém, vypíše správu s názvom súboru, riadkom a približným miestom chyby. Prvá chyba môže spôsobiť množstvo ďalších hlásení, preto najprv oprav tú najskoršiu zmysluplnú. Úspešná kompilácia však nezaručuje správny výsledok: program môže obsahovať logickú chybu alebo zlyhať až pri behu. Čítaj celé hlásenie a nespoliehaj sa iba na farbu označenia.' },
    { title: 'Funkcia main a knižnice', text: 'V bežnom konzolovom programe sa vykonávanie začína vo funkcii main. Hlavička ako stdio.h v C alebo iostream v C++ sprístupní deklarácie pre vstup a výstup. Príkazy v bloku sa vykonávajú postupne a bodkočiarka ukončuje väčšinu príkazov. return 0 z main tradične oznamuje, že program skončil úspešne. Ak hlavičku vynecháš alebo názov napíšeš nesprávne, compiler nemusí vedieť, čo daný symbol znamená.' },
    { title: 'C a C++ v praxi', text: 'C aj C++ dokážu pracovať blízko hardvéru a používajú sa v rôznych systémoch, zariadeniach a výkonných programoch. C má menšiu sadu štandardných nástrojov. C++ obsahuje rozsiahlejšie knižnice a abstrakcie, napríklad std::string a std::vector. Nemusíš sa hneď učiť ručnú správu pamäte. Začni výpisom textu, premennými, podmienkami a funkciami. Rovnaký algoritmus môžeš opísať v oboch jazykoch, aj keď sa ich syntax a knižnice líšia.' },
    { title: 'Od úpravy po spustenie', text: 'Typický cyklus je: uprav zdrojový súbor, spusti compiler, prečítaj prípadné hlásenie a spusti vytvorený program. Ak sa výsledok líši od očakávania, zapíš vstup a výstup a oprav jednu vec. Pri probléme over, že kompiluješ správny súbor a spúšťaš najnovší program. Konkrétny príkaz sa líši podľa compileru a systému, preto použi nastavený školský návod. Rozumieť cyklu je dôležitejšie než zapamätať si jeden príkaz.' },
  ],
  'lesson-types-variables-and-memory': [
    { title: 'Typ hovorí, čo hodnota znamená', text: 'Typ premennej určuje druh hodnoty a operácie, ktoré s ňou dávajú zmysel. int je bežná voľba pre celé čísla, double pre desatinné čísla, char pre jeden znak a bool pre true alebo false. C++ ponúka aj typy string a kontajnery ako vector. Výber správneho typu pomáha compileru odhaliť niektoré chyby a robí zámer programu čitateľnejším. Rozsah a presná veľkosť základných typov závisia od platformy a štandardu.' },
    { title: 'Inicializácia a životnosť', text: 'Premennú inicializuj pri vytvorení, aby mala známu hodnotu ešte pred prvým použitím. Neinicializovaná lokálna premenná môže obsahovať neurčenú hodnotu a jej čítanie vedie k nesprávnemu správaniu. Lokálna premenná existuje iba v oblasti, kde bola deklarovaná, napríklad v bloku funkcie. Keď blok skončí, jej bežná životnosť sa končí. Jasný scope znižuje počet miest, ktoré môžu hodnotu omylom zmeniť.' },
    { title: 'Čísla a prevody', text: 'Pri výpočte sleduj typy oboch strán. Delenie dvoch celočíselných hodnôt môže v C++ zahodiť desatinnú časť; výsledok 7 / 2 je preto celé číslo. Ak potrebuješ priemer, použi vhodný desatinný typ alebo bezpečný prevod. Prevody môžu stratiť informáciu, napríklad pri uložení 3.8 do int. Celé čísla majú obmedzený rozsah, preto pri práci s veľkými hodnotami vyber typ vedome a testuj hranice.' },
    { title: 'Konštanty a čitateľnosť', text: 'Ak sa hodnota nemá zmeniť, označ ju ako const. Konštanta pomenúva význam namiesto opakovania nejasného čísla, napríklad maxAttempts alebo taxRate. Názov premennej má prezradiť, čo uchováva, a type pomáha čitateľovi odhadnúť povolené operácie. C++ dokáže niekedy typ odvodiť cez auto, čo je užitočné pri zložitých názvoch, no začiatočník by mal vedieť rozpoznať výsledný typ a neskrývať ním dôležité informácie.' },
    { title: 'Pamäť bez zbytočného rizika', text: 'Premenná je spojená s miestom, kde program počas behu uchováva hodnotu. Zatiaľ stačí rozumieť tomu, že typ ovplyvňuje reprezentáciu a lokálny scope ovplyvňuje životnosť. Adresy a pointers umožňujú pracovať s umiestnením hodnôt, ale nesprávne použitie môže spôsobiť chyby. Na začiatku uprednostni obyčajné hodnoty, std::string a std::vector. Keď ich budeš vedieť bezpečne používať, neskôr sa ľahšie naučíš aj podrobnosti o pamäti.' },
  ],
  'lesson-keep-related-data-together': [
    { title: 'Kolekcia a index', text: 'Pole alebo kolekcia uchováva viac súvisiacich hodnôt pod jedným názvom. Index vyberie jednu položku. V mnohých jazykoch sa číslovanie začína nulou, takže prvá položka má index 0 a posledná index length - 1. Tento rozdiel je častým zdrojom chyby o jednu pozíciu. Ak má kolekcia päť hodnôt, platné indexy sú 0 až 4. Pred prístupom si vždy over počet prvkov a hranicu loopu.' },
    { title: 'Pole v C a vector v C++', text: 'Bežné pole v C má pevne určený počet prvkov a programátor musí pozorne pracovať s hranicami. V C++ std::vector uchováva prvky a poskytuje size() na zistenie ich počtu. Vector môže meniť veľkosť, keď pridáš ďalšiu hodnotu. Na začiatku je vector praktický spôsob, ako spravovať zoznam. Výber kolekcie závisí od úlohy, ale nikdy nepredpokladaj, že prístup za posledný prvok je bezpečný.' },
    { title: 'Prechádzanie a výpočty', text: 'Loop dokáže spracovať každý prvok bez kopírovania rovnakého príkazu. Pri každej položke môžeš vypočítať súčet, počet, priemer alebo nájsť najvyššiu hodnotu. Ak potrebuješ iba hodnoty, range-based for v C++ môže byť čitateľnejší než práca s indexom. Ak potrebuješ pozíciu, používaj index a kontroluj, že zostáva menší než veľkosť kolekcie. Začni so súčtom 0 a potom postupne pridávaj každú položku.' },
    { title: 'Prázdne a hraničné zoznamy', text: 'Algoritmus sa musí správať rozumne aj vtedy, keď zoznam neobsahuje žiadny prvok. Pri výpočte priemeru nesmieš deliť nulou. Hľadaná hodnota nemusí byť prítomná a kolekcia môže obsahovať iba jeden prvok. Otestuj prázdny zoznam, jeden prvok a niekoľko prvkov. Takéto testy často odhalia chybu skôr, než sa objaví v inom programe. Ošetrenie prázdneho prípadu zvyčajne patrí pred loop.' },
    { title: 'Dáta, ktoré spolu súvisia', text: 'Kolekcia je užitočná, keď údaje patria do jednej skupiny a chceš s nimi robiť rovnaké operácie. Ak máš skóre desiatich hráčov, pole je vhodnejšie než desať samostatných premenných. Premysli si však, či poradie položiek nesie význam a či treba údaje meniť. Dobre pomenovaná kolekcia, napríklad scores, vysvetľuje jej obsah. Pri zložitejších údajoch môže byť vhodný objekt alebo štruktúra, no princíp skupiny a prístupu k položke zostáva podobný.' },
  ],
  'lesson-debug-test-and-keep-improving': [
    { title: 'Tri druhy chýb', text: 'Syntax error znamená, že zápis porušuje pravidlá jazyka, napríklad chýba zátvorka alebo bodkočiarka. Runtime error vznikne počas vykonávania, napríklad pri prístupe k neexistujúcej hodnote. Logic error znamená, že program beží, ale výsledok nezodpovedá zámeru. Každý druh sa hľadá trochu inak. Compiler a browser často označia miesto problému, no jeho skutočná príčina môže byť o niekoľko riadkov skôr.' },
    { title: 'Opakovateľný postup', text: 'Najprv problém reprodukuj: zapíš presné kroky a vstup, pri ktorom sa objaví. Potom zisti očakávané správanie a porovnaj ho so skutočným. Prečítaj prvú užitočnú error message, pretože ďalšie chyby môžu byť iba následkom prvej. Zmeň jednu vec naraz a zopakuj ten istý test. Ak meníš viac častí súčasne, nevieš, ktorá úprava problém opravila alebo zhoršila.' },
    { title: 'Nástroje na hľadanie príčiny', text: 'Console môže zobraziť hodnoty pomocou console.log(). V debuggeri môžeš nastaviť breakpoint, pozastaviť program a prechádzať príkazy po jednom. Sleduj, ako sa menia premenné, a porovnaj ich s tým, čo si očakával. V C/C++ čítaj compiler warnings aj errors; upozornenie môže odhaliť chybu skôr, než sa prejaví. Odstráň dočasné výpisy alebo ich nahraď užitočným logovaním, keď problém vyriešiš.' },
    { title: 'Testy a hraničné prípady', text: 'Testovací príklad má jasný vstup a očakávaný výstup. Otestuj bežný prípad, najmenšiu alebo najväčšiu platnú hodnotu a neplatný vstup. Pri zozname pridaj aj prázdny a jednoprvkový prípad. Pred spustením odhadni správny výsledok, aby si si ho neprispôsobil tomu, čo program náhodou vypísal. Po oprave zopakuj predchádzajúce testy; tým overíš, že nová zmena nerozbila funkčnú časť.' },
    { title: 'Zrozumiteľné hlásenie problému', text: 'Keď nevieš chybu opraviť, priprav krátky opis: čo si urobil, čo si očakával a čo sa skutočne stalo. Pridaj najmenší príklad, ktorý problém stále ukazuje, a presné chybové hlásenie. Odstráň nesúvisiaci kód, aby sa príčina dala ľahšie nájsť. Takýto opis pomáha spolužiakovi alebo učiteľovi zopakovať chybu. Debugging nie je hádanie; je to zhromažďovanie dôkazov a kontrola jednej hypotézy po druhej.' },
  ],
  'lesson-write-code-thoughtfully': [
    { title: 'Najprv pochop zadanie', text: 'Nezačni písať kód skôr, než vieš povedať, aký problém riešiš. Prepíš zadanie vlastnými slovami a označ vstupy, požadovaný výstup a obmedzenia. Ak niečo nie je jasné, vytvor malý príklad a uveď, čo by mal program vrátiť. Predpoklady si zapíš. Nejasné zadanie vedie k programu, ktorý môže byť technicky správny, ale rieši nesprávnu úlohu. Rozdelenie problému na kroky šetrí čas pri implementácii aj testovaní.' },
    { title: 'Pseudokód pred syntaxou', text: 'Pseudokód opisuje algoritmus obyčajnými slovami a jednoduchými riadiacimi prvkami. Môže obsahovať NAČÍTAJ, AK, INAK, OPAKUJ a VYPÍŠ. Nemusí dodržiavať syntax JavaScriptu, C ani C++. Jeho cieľom je odhaliť chýbajúci krok ešte pred tým, než začneš riešiť zátvorky alebo typy. Skús pseudokód prejsť na papieri s konkrétnym vstupom. Ak nevieš určiť výsledok, algoritmus ešte potrebuje spresniť.' },
    { title: 'Čitateľné názvy a malé časti', text: 'Premenná totalPrice vysvetľuje svoj význam lepšie než x. Funkcia calculateAverage napovie, čo vykoná. Rozdeľ program na malé funkcie s jednou zodpovednosťou, no nezachádzaj do opačného extrému, keď každá drobnosť vytvára samostatnú vrstvu. Opakovaný kód je rizikom, pretože opravu musíš zopakovať na viacerých miestach. Ak majú kroky naozaj rovnaký účel, zabaľ ich do funkcie a odovzdaj rozdielne údaje cez parametre.' },
    { title: 'Over vstupy a vyhni sa hádam', text: 'Nevychádzaj z toho, že používateľ vždy zadá správnu hodnotu. Prázdny text, nula, záporné číslo alebo veľmi dlhý zoznam môžu zmeniť výsledok. Over podmienky, ktoré program potrebuje, a pri chybe ukáž zrozumiteľnú správu. Vyhni sa nevysvetleným číslam v kóde; pomenovaná konštanta objasní ich význam. Nepíš zbytočne zložitú optimalizáciu skôr, než máš funkčné a otestované jednoduché riešenie.' },
    { title: 'Komentáre, testy a učenie', text: 'Komentár má vysvetliť dôvod alebo dôležitý predpoklad, nie iba preložiť riadok kódu do slov. Kód udržuj v malých zmenách: uprav, spusti, otestuj a až potom pokračuj. Porovnaj skutočný výsledok s príkladom, ktorý si si pripravil vopred. Keď niečo nefunguje, prečítaj správu a vytvor najmenší opakovateľný prípad. Nepreberaj cudzí kód bez pochopenia; uprav ho po malých častiach a vedz, čo každá časť robí.' },
  ],
};

const lessonReadingContinuation = {
  'lesson-how-does-the-web-work': [
    { title: 'Zhrnutie toku dát', text: 'Skús si celý proces vysvetliť bez toho, aby si preskočil kroky: človek otvorí adresu, DNS pomôže nájsť server, browser odošle request a server vráti response. Browser spracuje HTML, vyžiada potrebné zdroje a vytvorí zobrazenú stránku. Ak sa niečo pokazí, pýtaj sa, v ktorom kroku: nenašla sa doména, server vrátil chybu, súbor sa nenačítal alebo JavaScript zmenil obsah nesprávne? Takéto otázky sú praktickejšie než všeobecné „web nefunguje“. Záznam v Network a Console ti poskytne dôkazy, podľa ktorých vieš vybrať ďalší krok.' },
  ],
  'lesson-give-a-page-its-structure': [
    { title: 'Od návrhu k sémantickej stránke', text: 'Pred vytvorením elementov si načrtni obsah: názov stránky, hlavné témy, navigáciu, odkazy a formuláre. Potom pre každú časť vyber element podľa jej účelu. Ak je text hlavnou témou, použi nadpis; ak je navigačná ponuka, použi nav. Neskúšaj dosiahnuť vzhľad prázdnymi elementmi alebo opakovanými medzerami; na to slúži CSS. Skontroluj, či dokument dáva zmysel aj pri vypnutých štýloch. Ak je poradie obsahu stále logické, pravdepodobne si vytvoril dobrý základ. Sémantika je rozhodnutie o význame, nie dekorácia.' },
  ],
  'lesson-make-it-look-the-way-you-imagined': [
    { title: 'Od zámeru ku kontrole', text: 'Pred písaním pravidiel pomenuj problém: potrebuješ zarovnať tlačidlá, oddeliť kartu od okolia alebo zmeniť rozloženie na mobile? Vyber najjednoduchšiu vlastnosť, ktorá problém rieši, a otestuj ju. Keď výsledok nesedí, skontroluj computed styles a rozmery boxu, nie iba celý súbor CSS naraz. Opakované hodnoty môžeš uložiť do CSS custom properties, aby sa farby a rozostupy dali meniť na jednom mieste. Po úprave skontroluj aj focus, kontrast, dlhý nadpis a menšiu šírku. Tak si overíš skutočný dizajn, nie iba jeden ideálny screenshot.' },
  ],
  'lesson-store-and-work-with-information': [
    { title: 'Od vstupu po výsledok', text: 'Pri každej hodnote si ujasni jej pôvod a použitie. Text napísaný do formulára je obyčajne string, aj keď vyzerá ako číslo. Ak ho chceš sčítať, najprv ho musíš bezpečne previesť a overiť, že prevod dáva zmysel. Potom ulož výpočet do premennej s jasným názvom a otestuj ho na známych hodnotách. Zvlášť si všímaj prázdny text, nulu a záporné číslo. Drobné experimenty v Console ukážu, ako JavaScript vyhodnocuje výraz, no výsledok si vždy vysvetli vlastnými slovami. Tak sa učíš pravidlá namiesto zapamätania jedného náhodného výstupu.' },
  ],
  'lesson-teach-your-code-to-make-decisions': [
    { title: 'Navrhni pravidlá ešte pred zápisom', text: 'Pred vytvorením podmienok napíš, aké výsledky môžu nastať a ktoré pravidlo vyberá každý z nich. Pri troch kategóriách sa uisti, že sa každá platná hodnota dostane práve do jednej vetvy. Pri loop napíš, s akou hodnotou začína, kedy pokračuje a ako sa posunie k ukončeniu. Tieto tri otázky odhalia väčšinu chýb hraníc. Potom postup ručne prejdi na malej hodnote. Ak sa počítadlo neposúva alebo vetva chýba, oprav algoritmus pred tým, než budeš hľadať chybu v syntaxe. Jasné pravidlo je ľahšie testovať aj vysvetliť.' },
  ],
  'lesson-bundle-steps-into-functions': [
    { title: 'Funkcia ako malá zmluva', text: 'Funkciu si môžeš predstaviť ako malú zmluvu: názov opisuje úlohu, parametre hovoria, aké údaje potrebuje, a return value vysvetľuje výsledok. Keď túto zmluvu dodrží, zvyšok programu nemusí poznať jej vnútorné kroky. Napríklad calculateTotal môže dostať cenu a množstvo a vrátiť sumu, ale nemala by zároveň meniť navigáciu stránky bez jasného dôvodu. Testuj funkciu samostatne s jednoduchými hodnotami. Ak je ťažké opísať jej účel jednou vetou, pravdepodobne robí príliš veľa a oplatí sa rozdeliť ju.' },
  ],
  'lesson-meet-c-and-c': [
    { title: 'Čo robiť, keď sa program neskompiluje', text: 'Keď compiler odmietne program, nezmaž celý súbor a nezačni odznova. Prečítaj prvé hlásenie, skontroluj riadok a najbližšie zátvorky, bodkočiarky alebo názvy. Správa môže ukazovať miesto, kde si compiler všimol problém, nie presne miesto, kde si ho spôsobil. Po jednej oprave skús kompiláciu znova. Keď sa program skompiluje, spusti ho s jednoduchým vstupom a porovnaj výstup s očakávaním. Tým oddelíš problém prekladu od chyby pri behu. Ukladaj si čistú verziu, ktorá funguje, aby si sa vedel vrátiť k známemu základu.' },
  ],
  'lesson-types-variables-and-memory': [
    { title: 'Výber typu podľa účelu', text: 'Typ vyberaj podľa toho, čo chceš reprezentovať, nie podľa toho, ktorý názov si práve zapamätáš. Počet žiakov je celé číslo; nameraná teplota môže potrebovať desatinnú časť; stav dokončenia sa hodí ako bool. Text mena patrí do string, nie do char, ktorý uchováva jeden znak. Potom premennú hneď inicializuj a vyber názov, ktorý vysvetľuje jednotku alebo význam, napríklad temperatureCelsius. Ak prevádzaš typ, opýtaj sa, či môže dôjsť k strate informácie. Compiler ti pomôže s kontrolou, ale zmysel údajov musíš zvoliť ty.' },
  ],
  'lesson-keep-related-data-together': [
    { title: 'Navrhni algoritmus pre kolekciu', text: 'Pred loop si stanov, čo má byť výsledkom. Pri súčte potrebuješ začať od nuly a pripočítať každú hodnotu. Pri hľadaní si ulož, či sa cieľ našiel, alebo môžeš skončiť hneď po úspechu. Pri maxime začni prvou položkou, ale iba po kontrole, že zoznam nie je prázdny. Každý algoritmus má predpoklady, napríklad typ prvkov alebo ich počet. Zapíš si ich a vytvor test pre každý dôležitý prípad. Potom vyber indexový loop alebo priamy priechod hodnotami podľa toho, čo skutočne potrebuješ.' },
  ],
  'lesson-debug-test-and-keep-improving': [
    { title: 'Zlepšenie bez náhodných zmien', text: 'Keď test zlyhá, najprv zachovaj vstup a správny očakávaný výsledok. Zmenšuj príklad, kým v ňom zostane iba to, čo chybu spôsobuje. Potom vytvor hypotézu, napríklad „počítadlo sa zvýši až po kontrole hranice“, a over ju krokovaním alebo výpisom. Oprav iba potvrdenú príčinu. Nakoniec zopakuj pôvodný test aj ostatné prípady. Ak chyba zmizla náhodou, no nevieš vysvetliť prečo, riešenie ešte nie je spoľahlivé. Krátky záznam o chybe a oprave pomôže, keď sa podobný problém objaví neskôr.' },
  ],
  'lesson-write-code-thoughtfully': [
    { title: 'Jednoduché riešenie, ktoré vieš obhájiť', text: 'Dobré riešenie nemusí mať najmenej riadkov; má byť správne, zrozumiteľné a primerané úlohe. Krátke, ale nejasné skratky často sťažujú opravu. Po napísaní kódu si prejdi každý názov, podmienku a opakovaný krok: vie spolužiak pochopiť zámer bez hádania? Potom spusti príklady, ktoré si pripravil, a pridaj aspoň jeden okrajový vstup. Ak sa správanie líši od plánu, uprav pseudokód alebo implementáciu a skús to znova. Schopnosť vysvetliť, prečo riešenie funguje, je dôležitejšia než rýchle skopírovanie cudzieho výsledku.' },
  ],
};

const lessonReadingFinalNotes = {
  'lesson-debug-test-and-keep-improving': [
    { title: 'Predchádzaj opakovaniu chyby', text: 'Po vyriešení chyby sa zamysli, ako jej predísť. Pomôže test, kontrola vstupu, jasnejší názov alebo jednoduchší algoritmus. Neodstraňuj kontrolu len preto, aby program prestal hlásiť chybu; problém môže zostať ukrytý vo výsledkoch. Pri tímovej práci uveď, čo sa zmenilo a prečo. Oddeľ opravu od nesúvisiacich úprav, aby sa dala ľahko skontrolovať. Ak chyba vznikla pri hranici loopu, pridaj test presne na túto hranicu. Ak ju spôsobil prázdny vstup, over, že program teraz vráti zrozumiteľný výsledok. Vráť sa k pôvodnému príkladu aj po ďalších zmenách a skontroluj, že oprava stále funguje. Tak sa jednorazová oprava zmení na spoľahlivejší program.' },
  ],
  'lesson-bundle-steps-into-functions': [
    { title: 'Navrhni zrozumiteľné volanie', text: 'Ak funkcia potrebuje veľa parametrov, zváž, či jej úlohu nemožno rozdeliť alebo vstupy pomenovať zrozumiteľnejšie. Vyhni sa parametru mode, ktorý nečakane prepína správanie na viacerých miestach. Volanie funkcie má byť čitateľné aj bez otvorenia jej definície. Keď zmeníš počet alebo význam parametrov, skontroluj každé miesto, ktoré funkciu používa. Malá funkcia nie je automaticky dobrá; dôležité je, aby jej názov, vstup, výsledok a vedľajšie účinky tvorili predvídateľný celok. Ak musíš dlho vysvetľovať, čo funkcia robí, jej zodpovednosť alebo názov asi potrebuje spresnenie.' },
  ],
};

function localizeStaticCopy() {
  const setText = (selector, text) => {
    const element = document.querySelector(selector);
    if (element) element.textContent = text;
  };
  const setChildText = (selector, childIndex, text) => {
    const element = document.querySelector(selector);
    if (element?.childNodes[childIndex]) element.childNodes[childIndex].textContent = text;
  };
  const setTexts = (selector, values) => {
    document.querySelectorAll(selector).forEach((element, index) => {
      if (values[index] !== undefined) element.textContent = values[index];
    });
  };

  document.title = 'CodeQuest — Prvé kroky v programovaní';
  document.querySelector('meta[name="description"]').content = 'Praktický sprievodca pre začiatočníkov: HTML, CSS, JavaScript a základy programovania v C a C++.';
  setText('.skip-link', 'Preskočiť na hlavný obsah');
  document.querySelector('.brand[aria-label]').setAttribute('aria-label', 'Domovská stránka CodeQuest');
  document.querySelector('.menu-toggle').setAttribute('aria-label', 'Otvoriť navigáciu');
  document.querySelector('.main-nav').setAttribute('aria-label', 'Hlavná navigácia');
  setTexts('.main-nav a', ['Učebná cesta', 'Lekcie', 'Projekty', 'Rýchla pomôcka']);
  setChildText('.header-cta', 0, 'Začať sa učiť ');

  setChildText('.hero-copy .eyebrow', 1, ' Sprievodca pre budúcich tvorcov');
  document.querySelector('.hero h1').innerHTML = 'Od prvého<br>riadku až po <span class="highlight-word">vlastný web.</span>';
  setText('.hero-description', 'Nauč sa tvoriť webové stránky pomocou HTML, CSS a JavaScriptu. Popritom si osvojíš spôsob premýšľania, ktorý využiješ aj pri programovaní v C a C++.');
  setChildText('.hero-actions .button', 0, 'Pozrieť učebnú cestu ');
  setChildText('.no-experience', 1, ' Začiatočnícke skúsenosti netreba');
  setTexts('.hero-facts div span', ['učebné oblasti', 'základných lekcií', 'nápadov na projekty']);
  setTexts('.hero-facts div strong', ['4', String(lessonCards.length), '∞']);
  setChildText('.window-footer > span:first-child', 1, ' Všetko pripravené');
  const codeStrings = document.querySelectorAll('.code-lines .code-green');
  codeStrings[codeStrings.length - 1].textContent = '"Poďme tvoriť!"';
  document.querySelector('.hero-art').setAttribute('aria-label', 'Ilustrácia zdrojového kódu v editore');

  setText('.roadmap-heading .eyebrow', 'TVOJA UČEBNÁ CESTA');
  setText('.roadmap-heading h2', 'Krok za krokom.');
  setText('.roadmap-heading > p', 'Začni stavebnými základmi webu. Potom rovnaké princípy využiješ pri programovaní v C a C++.');
  setTexts('.path-number', ['01 / WEB', '02 / ZÁKLADY PROGRAMOVANIA', '03 / TVORBA']);
  setTexts('.path-card h3', ['Tvor pre browser', 'Mysli ako programátor', 'Uč sa tvorbou']);
  setTexts('.path-card > p', [
    'Vytváraj štruktúru stránky, uprav jej vzhľad a pridaj interakcie.',
    'Osvoj si premenné, logiku, funkcie a základy pamäte v C a C++.',
    'Premieňaj nové vedomosti na malé projekty a skúšaj vlastné nápady.',
  ]);
  document.querySelectorAll('.path-card .text-link').forEach((element, index) => {
    element.firstChild.textContent = ['Otvoriť webové lekcie ', 'Otvoriť lekcie C a C++ ', 'Pozrieť nápady na projekty '][index];
  });
  setTexts('.path-card:first-child .path-tags span', ['HTML', 'CSS', 'JavaScript']);
  setTexts('.path-card:nth-child(2) .path-tags span', ['C', 'C++', 'Logické myslenie']);
  setTexts('.path-card:nth-child(3) .path-tags span', ['Precvičovanie', 'Projekty', 'Zvedavosť']);

  setText('.curriculum-heading .eyebrow', 'UČEBNÝ PLÁN');
  document.querySelector('.curriculum-heading h2').innerHTML = 'Osvoj si <span class="serif-italic">základy.</span>';
  setText('.curriculum-heading > p', 'Postupuj vlastným tempom. V každej lekcii si prečítaj vysvetlenie, splň všetkých 15 praktických úloh a potom označ lekciu ako dokončenú. Tvoj postup sa ukladá automaticky.');
  document.querySelectorAll('.filter-button').forEach((button, index) => {
    button.firstChild.textContent = ['Všetko ', 'Web ', 'C a C++ '][index];
    button.querySelector('span').textContent = lessonCards.filter((card) => button.dataset.filter === 'all' || card.dataset.category === button.dataset.filter).length;
  });
  document.querySelector('.search-box input').placeholder = 'Hľadať lekciu...';
  document.querySelector('.search-box input').setAttribute('aria-label', 'Hľadať lekcie');

  setTexts('.lesson-main > strong', [
    'Čo sa deje, keď otvoríš web?',
    'HTML: kostra webovej stránky',
    'CSS: vzhľad a rozloženie',
    'JavaScript: premenné a hodnoty',
    'Podmienky a opakovanie',
    'Funkcie: znovupoužiteľné kroky',
    'Prvý program v C a C++',
    'Typy a premenné v C/C++',
    'Zoznamy: array a vector',
    'Debugging a testovanie',
    'Programuj premyslene',
  ]);
  setTexts('.lesson-short', [
    'Spoznaj browser, server a cestu, ktorou sa stránka dostane na obrazovku.',
    'Usporiadaj obsah pomocou elementov, nadpisov, odkazov a sémantického HTML.',
    'Použi CSS na farby, rozostupy, layout a prispôsobenie rôznym obrazovkám.',
    'Ukladaj údaje do premenných a pracuj s rôznymi typmi hodnôt.',
    'Rozhoduj pomocou conditions a opakuj kroky pomocou loops.',
    'Rozdeľ program na menšie časti pomocou parameters a return values.',
    'Zisti, ako compiler preloží program v C alebo C++.',
    'Spoznaj typy hodnôt a to, ako sa ukladajú v pamäti.',
    'Ukladaj viac hodnôt do array alebo vector a prejdi ich pomocou loop.',
    'Hľadaj chyby systematicky a over program na rôznych vstupoch.',
    'Vyhni sa zlým návykom, vyber si lepší postup a naplánuj riešenie pseudokódom.',
  ]);
  setTexts('.lesson-tag', ['ZÁKLADY WEBU', 'HTML', 'CSS', 'JAVASCRIPT', 'JAVASCRIPT', 'JAVASCRIPT', 'C A C++', 'C A C++', 'C A C++', 'C A C++', 'PROGRAMÁTORSKÉ NÁVYKY']);
  document.querySelectorAll('.lesson-meta span:last-child').forEach((element) => {
    element.textContent = element.textContent.replace('MIN', 'min');
  });

  setText('.concept-copy .eyebrow', 'JEDNA MYŠLIENKA, VIAC JAZYKOV');
  document.querySelector('.concept-copy h2').innerHTML = 'Najprv pochop <span>myšlienku.</span><br>Potom syntax.';
  setText('.concept-copy > p', 'Keď pochopíš programátorský princíp v jednom jazyku, ľahšie ho spoznáš aj v inom. Pozri sa na rovnaký pozdrav v JavaScripte a C++.');
  setText('.concept-note strong', 'Nemusíš si všetko zapamätať.');
  document.querySelector('.concept-note p').lastChild.textContent = 'Precvičuj čítanie kódu, kladenie otázok a malé úpravy. Takto sa učia aj skúsení programátori.';
  setText('.compare-title', 'Jednoduchý pozdrav');
  setText('.code-divider', 'rovnaký princíp');
  setTexts('.compare-caption span', ['Oba programy uložia meno a vypíšu pozdrav.', 'Iná syntax, rovnaké myslenie']);
  setTexts('.compare-code .syntax-green', ['"Eva"', '`Ahoj, ${person}!`', '"Eva"', '"Ahoj, "']);

  setText('.projects-heading .eyebrow', 'VYSKÚŠAJ SI TO V PRAXI');
  document.querySelector('.projects-heading h2').innerHTML = 'Malé projekty.<br><span class="serif-italic">Veľké sebavedomie.</span>';
  setText('.projects-heading > p', 'Najlepšie sa učí tvorbou. Vyber si nápad, ktorý ťa baví, a začni jeho najjednoduchšou verziou.');
  setTexts('.project-number', ['01 — WEB', '02 — WEB', '03 — C / C++']);
  setTexts('.project-card h3', ['Stránka o tebe', 'Počítadlo kliknutí', 'Hra: uhádni číslo']);
  setTexts('.project-card > p', [
    'Použi HTML na svoj príbeh a CSS na vzhľad, ktorý ťa vystihuje.',
    'Nauč tlačidlá reagovať na kliknutie a meniť obsah stránky.',
    'Precvič conditions, loops a vstup používateľa v malej konzolovej hre.',
  ]);
  setTexts('.project-skills span', ['HTML', 'CSS', 'JavaScript', 'Udalosti', 'DOM', 'C alebo C++', 'Logika']);
  setText('.counter-label', 'TVOJE SKÓRE');
  document.querySelector('#count-down').setAttribute('aria-label', 'Znížiť skóre v ukážke');
  document.querySelector('#count-up').setAttribute('aria-label', 'Zvýšiť skóre v ukážke');
  setText('.terminal-prompt', '> hádaj číslo_');
  setText('.terminal-response', 'Príliš nízko! Skús znova.');

  setText('.cheatsheet-layout .eyebrow', 'POMÔCKA NA NESKÔR');
  document.querySelector('.cheatsheet-layout h2').innerHTML = 'Dobré návyky<br>ti pomôžu rásť.';
  setText('.cheatsheet-layout > div:first-child > p', 'Nemusíš vedieť všetko hneď. Vráť sa k týmto tipom, keď ich budeš potrebovať.');
  const habitTitles = [
    'Píš po malých častiach a často spúšťaj program.',
    'Prečítaj si error message.',
    'Dávaj premenným výstižné názvy.',
    'Pýtaj sa „čo ak?“',
    'Oddýchni si a zachovaj si zvedavosť.',
  ];
  const habitNotes = [
    ' Malé kroky sa ľahšie kontrolujú a opravujú.',
    ' Je to stopa, nie výčitka.',
    ' je zrozumiteľnejší názov než ',
    ' Vyskúšaj iný vstup a sleduj, čo program urobí.',
    ' Aj profesionáli si informácie vyhľadávajú.',
  ];
  document.querySelectorAll('.habit-list > div > p').forEach((paragraph, index) => {
    const heading = paragraph.querySelector('strong');
    heading.textContent = habitTitles[index];
    paragraph.replaceChildren(heading, document.createTextNode(habitNotes[index]));
    if (index === 2) {
      const nameExample = document.createElement('code');
      const alternative = document.createElement('code');
      nameExample.textContent = 'studentName';
      alternative.textContent = 'x';
      paragraph.replaceChildren(heading, document.createTextNode(' Názov '), nameExample, document.createTextNode(' je zrozumiteľnejší než '), alternative, document.createTextNode('.'));
    }
  });

  setText('.final-cta .eyebrow', 'DÔLEŽITÝ JE PRVÝ KROK');
  setText('.final-cta h2', 'Môžeš začať.');
  setText('.final-cta p', 'Vyber si lekciu, vyskúšaj príklady a vytvor niečo vlastné.');
  setChildText('.final-cta .button', 0, 'Začať prvou lekciou ');
  setText('.site-footer > span', 'Pre zvedavé hlavy. Tvor ďalej. ✳');
  setText('.site-footer > a:last-child', 'Späť na začiatok ↑');
  setText('.empty-state', 'Nenašli sa žiadne lekcie. Skús zadať iné slovo.');
  document.querySelector('.progress-track').setAttribute('aria-label', 'Postup podľa dokončených lekcií');
  document.querySelector('#reset-progress').textContent = 'Vynulovať postup';
}

localizeStaticCopy();

function createLessonId(card) {
  const title = card.querySelector('.lesson-main > strong').textContent;
  const slug = title.toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
  return `lesson-${slug}`;
}

lessonCards.forEach((card, index) => {
  card.dataset.lessonId = stableLessonIds[index] ?? createLessonId(card);
  const learning = lessonContent[card.dataset.lessonId];
  const detail = card.querySelector('.lesson-detail');
  detail.querySelector('p').textContent = learning.intro;
  detail.querySelector('.lesson-takeaway strong').textContent = 'Zapamätaj si';
  detail.querySelector('.lesson-takeaway span').textContent = learning.takeaway;

  const notes = document.createElement('section');
  const notesTitle = document.createElement('h4');
  const explanation = document.createElement('p');
  const pointsTitle = document.createElement('h5');
  const points = document.createElement('ul');
  notes.className = 'lesson-notes';
  notesTitle.textContent = 'Ako to funguje';
  explanation.textContent = learning.explanation;
  pointsTitle.textContent = 'Dôležité body';
  notes.append(notesTitle, explanation);
  for (const section of [
    ...lessonReading[card.dataset.lessonId],
    ...lessonReadingContinuation[card.dataset.lessonId],
    ...(lessonReadingFinalNotes[card.dataset.lessonId] ?? []),
  ]) {
    const sectionTitle = document.createElement('h5');
    const sectionText = document.createElement('p');
    sectionTitle.textContent = section.title;
    sectionText.className = 'reading-paragraph';
    sectionText.textContent = section.text;
    notes.append(sectionTitle, sectionText);
  }
  for (const point of learning.points) {
    const item = document.createElement('li');
    item.textContent = point;
    points.append(item);
  }
  notes.append(pointsTitle, points);

  for (const example of learning.examples) {
    const exampleBlock = document.createElement('div');
    const exampleTitle = document.createElement('h5');
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    exampleBlock.className = 'lesson-example';
    exampleTitle.textContent = `Ukážka: ${example.label}`;
    pre.className = 'lesson-code';
    code.textContent = example.code;
    pre.append(code);
    exampleBlock.append(exampleTitle, pre);
    notes.append(exampleBlock);
  }
  detail.querySelector('.lesson-takeaway').before(notes);

  const taskList = document.createElement('ul');
  taskList.className = 'task-list';

  for (const task of lessonTasks[card.dataset.lessonId] ?? []) {
    const taskId = `${card.dataset.lessonId}-${task.id}`;
    const item = document.createElement('li');
    const label = document.createElement('label');
    const checkbox = document.createElement('input');
    const checkmark = document.createElement('span');
    const description = document.createElement('span');

    label.className = 'task-item';
    checkbox.type = 'checkbox';
    checkbox.dataset.taskId = taskId;
    checkmark.className = 'task-checkmark';
    checkmark.setAttribute('aria-hidden', 'true');
    checkmark.textContent = '✓';
    description.className = 'task-description';
    description.textContent = task.text;
    label.append(checkbox, checkmark, description);
    const example = document.createElement('details');
    const exampleSummary = document.createElement('summary');
    const exampleInstruction = document.createElement('p');
    const examplePre = document.createElement('pre');
    const exampleCode = document.createElement('code');
    example.className = 'task-repair';
    exampleSummary.textContent = 'Ukážka kódu na opravu';
    exampleInstruction.className = 'task-repair-instruction';
    exampleInstruction.textContent = 'Nájdi, čo v ukážke bráni dosiahnuť cieľ. Oprav kód a potom si over výsledok.';
    examplePre.className = 'task-repair-code';
    exampleCode.textContent = task.example;
    examplePre.append(exampleCode);
    example.append(exampleSummary, exampleInstruction, examplePre);
    item.append(label, example);
    taskList.append(item);
  }

  const taskPanel = document.createElement('section');
  const taskHeading = document.createElement('div');
  const taskTitle = document.createElement('h4');
  const taskCount = document.createElement('span');
  taskPanel.className = 'task-panel';
  taskHeading.className = 'task-heading';
  taskTitle.textContent = 'Praktické úlohy';
  taskCount.className = 'task-count';
  taskCount.textContent = `0/${taskList.children.length} hotové`;
  taskHeading.append(taskTitle, taskCount);
  taskPanel.append(taskHeading, taskList);
  card.querySelector('.complete-button').before(taskPanel);
});

const validLessonIds = new Set(lessonCards.map((card) => card.dataset.lessonId));
const taskCheckboxes = [...document.querySelectorAll('.task-list input[type="checkbox"]')];
const validTaskIds = new Set(taskCheckboxes.map((checkbox) => checkbox.dataset.taskId));

function readProgress() {
  try {
    const raw = localStorage.getItem(storageKey);
    if (raw) {
      let saved;
      try {
        saved = JSON.parse(raw);
      } catch {
        saved = null;
      }
      if (saved && saved.version === 2 && Array.isArray(saved.completedLessons) && Array.isArray(saved.completedTasks)) {
        return {
          completedLessons: new Set(saved.completedLessons.filter((id) => validLessonIds.has(id))),
          completedTasks: new Set(saved.completedTasks.filter((id) => validTaskIds.has(id))),
          updatedAt: typeof saved.updatedAt === 'string' && Number.isFinite(Date.parse(saved.updatedAt))
            ? saved.updatedAt
            : null,
          migrated: false,
          available: true,
        };
      }
      if (saved && saved.version === 1 && Array.isArray(saved.completed)) {
        return {
          completedLessons: new Set(saved.completed.filter((id) => validLessonIds.has(id))),
          completedTasks: new Set(),
          updatedAt: typeof saved.updatedAt === 'string' && Number.isFinite(Date.parse(saved.updatedAt))
            ? saved.updatedAt
            : null,
          migrated: true,
          available: true,
        };
      }
    }

    const legacyRaw = localStorage.getItem(legacyStorageKey);
    if (legacyRaw) {
      let legacy;
      try {
        legacy = JSON.parse(legacyRaw);
      } catch {
        legacy = [];
      }
      const completedLessons = new Set();
      if (Array.isArray(legacy)) {
        legacy.forEach((id) => {
          const match = typeof id === 'string' && /^lesson-(\d+)$/.exec(id);
          const card = match ? lessonCards[Number(match[1]) - 1] : null;
          if (card) completedLessons.add(card.dataset.lessonId);
        });
      }
      return { completedLessons, completedTasks: new Set(), updatedAt: null, migrated: true, available: true };
    }

    return { completedLessons: new Set(), completedTasks: new Set(), updatedAt: null, migrated: false, available: true };
  } catch {
    return { completedLessons: new Set(), completedTasks: new Set(), updatedAt: null, migrated: false, available: false };
  }
}

const loadedProgress = readProgress();
const completedLessons = loadedProgress.completedLessons;
const completedTasks = loadedProgress.completedTasks;

function showSavedAt(timestamp) {
  if (!saveStatus) return;
  if (!loadedProgress.available) {
    saveStatus.textContent = 'Úložisko browsera nie je dostupné; postup sa nemusí zachovať.';
    return;
  }
  saveStatus.textContent = timestamp
    ? `Naposledy uložené: ${new Date(timestamp).toLocaleString()}. Tento browser a toto zariadenie.`
    : 'Postup sa ukladá v tomto browseri na tomto zariadení.';
}

function saveProgress() {
  const updatedAt = new Date().toISOString();
  try {
    localStorage.setItem(storageKey, JSON.stringify({
      version: 2,
      completedLessons: [...completedLessons],
      completedTasks: [...completedTasks],
      updatedAt,
    }));
    try {
      localStorage.removeItem(legacyStorageKey);
    } catch {
      // Keep the new progress even if an old key cannot be removed.
    }
    loadedProgress.available = true;
    loadedProgress.updatedAt = updatedAt;
    showSavedAt(updatedAt);
    return true;
  } catch {
    loadedProgress.available = false;
    showSavedAt(null);
    return false;
  }
}

function updateProgress() {
  const completedCount = lessonCards.filter((card) => completedLessons.has(card.dataset.lessonId)).length;
  const completedTaskCount = taskCheckboxes.filter((checkbox) => completedTasks.has(checkbox.dataset.taskId)).length;
  const percentage = lessonCards.length
    ? Math.round((completedCount / lessonCards.length) * 100)
    : 0;
  progressBar.setAttribute('aria-valuemax', String(lessonCards.length));
  progressFill.style.width = `${percentage}%`;
  progressLabel.textContent = `${completedCount} z ${lessonCards.length} lekcií dokončených`;
  taskProgressLabel.textContent = `${completedTaskCount} z ${taskCheckboxes.length} úloh splnených`;
  progressPercent.textContent = `${percentage}%`;
  progressBar.setAttribute('aria-valuenow', String(completedCount));

  lessonCards.forEach((card) => {
    const isComplete = completedLessons.has(card.dataset.lessonId);
    const cardTasks = taskCheckboxes.filter((checkbox) => checkbox.closest('.lesson-card') === card);
    const cardTasksComplete = cardTasks.filter((checkbox) => completedTasks.has(checkbox.dataset.taskId)).length;
    const allTasksComplete = cardTasks.length > 0 && cardTasksComplete === cardTasks.length;
    card.classList.toggle('done', isComplete);
    const label = card.querySelector('.status-label');
    const completeButton = card.querySelector('.complete-button');
    label.textContent = isComplete ? 'Hotovo' : `${cardTasksComplete}/${cardTasks.length} úloh`;
    completeButton.disabled = !isComplete && !allTasksComplete;
    completeButton.firstChild.textContent = isComplete
      ? 'Lekcia dokončená '
      : allTasksComplete
        ? 'Dokončiť lekciu '
        : `Zostáva ${cardTasks.length - cardTasksComplete} ${cardTasks.length - cardTasksComplete === 1 ? 'úloha' : 'úloh'} `;
    completeButton.setAttribute('aria-pressed', String(isComplete));

    card.querySelector('.task-count').textContent = `${cardTasksComplete}/${cardTasks.length} hotové`;
    cardTasks.forEach((checkbox) => {
      const isTaskComplete = completedTasks.has(checkbox.dataset.taskId);
      checkbox.checked = isTaskComplete;
      checkbox.closest('.task-item').classList.toggle('done', isTaskComplete);
    });
  });
}

function applyFilters() {
  const query = searchInput.value.trim().toLowerCase();
  let visibleCount = 0;

  lessonCards.forEach((card) => {
    const matchesFilter = activeFilter === 'all' || card.dataset.category === activeFilter;
    const matchesSearch = !query || `${card.dataset.search} ${card.textContent}`.toLowerCase().includes(query);
    const isVisible = matchesFilter && matchesSearch;
    card.hidden = !isVisible;
    if (isVisible) visibleCount += 1;
  });

  emptyState.hidden = visibleCount > 0;
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('visible');
  window.clearTimeout(toastTimer);
  toastTimer = window.setTimeout(() => toast.classList.remove('visible'), 2600);
}

lessonCards.forEach((card) => {
  const summary = card.querySelector('.lesson-summary');
  const detail = card.querySelector('.lesson-detail');
  detail.id = `${card.dataset.lessonId}-details`;
  summary.setAttribute('aria-controls', detail.id);

  summary.addEventListener('click', () => {
    const willOpen = !card.classList.contains('open');
    card.classList.toggle('open', willOpen);
    summary.setAttribute('aria-expanded', String(willOpen));
  });

  card.querySelector('.complete-button').addEventListener('click', () => {
    const wasComplete = completedLessons.has(card.dataset.lessonId);
    if (wasComplete) {
      completedLessons.delete(card.dataset.lessonId);
    } else {
      completedLessons.add(card.dataset.lessonId);
    }

    if (!saveProgress()) {
      showToast('Postup sa zmenil, ale úložisko browsera nie je dostupné.');
    } else {
      showToast(wasComplete ? 'Lekcia je opäť rozpracovaná.' : 'Výborne! Postup sa uložil.');
    }
    updateProgress();
  });
});

taskCheckboxes.forEach((checkbox) => {
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      completedTasks.add(checkbox.dataset.taskId);
    } else {
      completedTasks.delete(checkbox.dataset.taskId);
    }

    if (!saveProgress()) {
      showToast('Úloha sa zmenila, ale úložisko browsera nie je dostupné.');
    }
    updateProgress();
  });
});

showSavedAt(loadedProgress.updatedAt);
if (loadedProgress.migrated) saveProgress();
updateProgress();

resetProgressButton.addEventListener('click', () => {
  if (completedLessons.size === 0 && completedTasks.size === 0) {
    showToast('Zatiaľ nemáš žiadny postup na vynulovanie.');
    return;
  }
  if (!window.confirm('Naozaj chceš vynulovať postup vo všetkých lekciách a úlohách?')) return;

  completedLessons.clear();
  completedTasks.clear();
  const saved = saveProgress();
  updateProgress();
  showToast(saved ? 'Postup bol vynulovaný.' : 'Postup sa vynuloval iba pre túto návštevu; uložiť sa ho nepodarilo.');
});

window.addEventListener('storage', (event) => {
  if (event.key !== storageKey) return;
  try {
    const saved = event.newValue ? JSON.parse(event.newValue) : null;
    const lessonIds = saved && saved.version === 2 && Array.isArray(saved.completedLessons)
      ? saved.completedLessons.filter((id) => validLessonIds.has(id))
      : [];
    const taskIds = saved && saved.version === 2 && Array.isArray(saved.completedTasks)
      ? saved.completedTasks.filter((id) => validTaskIds.has(id))
      : [];
    completedLessons.clear();
    lessonIds.forEach((id) => completedLessons.add(id));
    completedTasks.clear();
    taskIds.forEach((id) => completedTasks.add(id));
    loadedProgress.updatedAt = typeof saved?.updatedAt === 'string' && Number.isFinite(Date.parse(saved.updatedAt))
      ? saved.updatedAt
      : null;
    loadedProgress.available = true;
    showSavedAt(loadedProgress.updatedAt);
    updateProgress();
  } catch {
    showToast('Postup z inej karty sa nepodarilo načítať.');
  }
});

for (const button of document.querySelectorAll('.filter-button')) {
  button.addEventListener('click', () => {
    activeFilter = button.dataset.filter;
    document.querySelectorAll('.filter-button').forEach((tab) => {
      const selected = tab === button;
      tab.classList.toggle('active', selected);
      tab.setAttribute('aria-pressed', String(selected));
    });
    applyFilters();
  });
}

searchInput.addEventListener('input', applyFilters);
document.addEventListener('keydown', (event) => {
  if (event.key === '/' && !['INPUT', 'TEXTAREA'].includes(document.activeElement.tagName)) {
    event.preventDefault();
    searchInput.focus();
  }
  if (event.key === 'Escape' && document.activeElement === searchInput) {
    searchInput.value = '';
    applyFilters();
    searchInput.blur();
  }
});

const menuToggle = document.querySelector('.menu-toggle');
const mainNav = document.querySelector('.main-nav');
menuToggle.addEventListener('click', () => {
  const isOpen = mainNav.classList.toggle('open');
  menuToggle.setAttribute('aria-expanded', String(isOpen));
  menuToggle.setAttribute('aria-label', isOpen ? 'Zavrieť navigáciu' : 'Otvoriť navigáciu');
});
mainNav.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => {
    mainNav.classList.remove('open');
    menuToggle.setAttribute('aria-expanded', 'false');
    menuToggle.setAttribute('aria-label', 'Otvoriť navigáciu');
  });
});

let demoCount = 0;
const demoCountOutput = document.querySelector('#demo-count');
function updateDemoCount() {
  demoCountOutput.textContent = String(demoCount).padStart(2, '0');
}
document.querySelector('#count-up').addEventListener('click', () => {
  demoCount += 1;
  updateDemoCount();
});
document.querySelector('#count-down').addEventListener('click', () => {
  demoCount = Math.max(0, demoCount - 1);
  updateDemoCount();
});
