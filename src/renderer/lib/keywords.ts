const deStopwords = `á a ab aber ach acht achte achten achter achtes ag alle allein allem allen
aller allerdings alles allgemeinen als also am an andere anderen anderem andern
anders auch auf aus ausser außer ausserdem außerdem
bald bei beide beiden beim beispiel bekannt bereits besonders besser besten bin
bis bisher bist
da dabei dadurch dafür dagegen daher dahin dahinter damals damit danach daneben
dank dann daran darauf daraus darf darfst darin darüber darum darunter das
dasein daselbst dass daß dasselbe davon davor dazu dazwischen dein deine deinem
deiner dem dementsprechend demgegenüber demgemäss demgemäß demselben demzufolge
den denen denn denselben der deren derjenige derjenigen dermassen dermaßen
derselbe derselben des deshalb desselben dessen deswegen dich die diejenige
diejenigen dies diese dieselbe dieselben diesem diesen dieser dieses dir doch
dort drei drin dritte dritten dritter drittes du durch durchaus dürfen dürft
durfte durften
eben ebenso ehrlich eigen eigene eigenen eigener eigenes ein einander eine
einem einen einer eines einige einigen einiger einiges einmal einmaleins elf en
ende endlich entweder er erst erste ersten erster erstes es etwa etwas euch
früher fünf fünfte fünften fünfter fünftes für
gab ganz ganze ganzen ganzer ganzes gar gedurft gegen gegenüber gehabt gehen
geht gekannt gekonnt gemacht gemocht gemusst genug gerade gern gesagt geschweige
gewesen gewollt geworden gibt ging gleich gross groß grosse große grossen
großen grosser großer grosses großes gut gute guter gutes
habe haben habt hast hat hatte hätte hatten hätten heisst heißt her heute hier
hin hinter hoch
ich ihm ihn ihnen ihr ihre ihrem ihren ihrer ihres im immer in indem
infolgedessen ins irgend ist
ja jahr jahre jahren je jede jedem jeden jeder jedermann jedermanns jedoch
jemand jemandem jemanden jene jenem jenen jener jenes jetzt
kam kann kannst kaum kein keine keinem keinen keiner kleine kleinen kleiner
kleines kommen kommt können könnt konnte könnte konnten kurz
lang lange leicht leider lieber los
machen macht machte mag magst man manche manchem manchen mancher manches mehr
mein meine meinem meinen meiner meines mich mir mit mittel mochte möchte mochten
mögen möglich mögt morgen muss muß müssen musst müsst musste mussten
na nach nachdem nahm natürlich neben nein neue neuen neun neunte neunten neunter
neuntes nicht nichts nie niemand niemandem niemanden noch nun nur
ob oben oder offen oft ohne
recht rechte rechten rechter rechtes richtig rund
sagt sagte sah satt schlecht schon sechs sechste sechsten sechster sechstes
sehr sei seid seien sein seine seinem seinen seiner seines seit seitdem selbst
selbst sich sie sieben siebente siebenten siebenter siebentes siebte siebten
siebter siebtes sind so solang solche solchem solchen solcher solches soll
sollen sollte sollten sondern sonst sowie später statt
tag tage tagen tat teil tel trotzdem tun
über überhaupt übrigens uhr um und uns unser unsere unserer unter
vergangene vergangenen viel viele vielem vielen vielleicht vier vierte vierten
vierter viertes vom von vor
wahr während währenddem währenddessen wann war wäre waren wart warum was wegen
weil weit weiter weitere weiteren weiteres welche welchem welchen welcher
welches wem wen wenig wenige weniger weniges wenigstens wenn wer werde werden
werdet wessen wie wieder will willst wir wird wirklich wirst wo wohl wollen
wollt wollte wollten worden wurde würde wurden würden
zehn zehnte zehnten zehnter zehntes zeit zu zuerst zugleich zum zunächst zur
zurück zusammen zwanzig zwar zwei zweite zweiten zweiter zweites zwischen`;

const enStopwords = `a about above across after afterwards again against all almost alone along
already also although always am among amongst amount an and another any anyhow
anyone anything anyway anywhere are around as at
back be became because become becomes becoming been before beforehand behind
being below beside besides between beyond both bottom but by
call can cannot ca could
did do does doing done down due during
each eight either eleven else elsewhere empty enough even ever every
everyone everything everywhere except
few fifteen fifty first five for former formerly forty four from front full
further
get give go
had has have he hence her here hereafter hereby herein hereupon hers herself
him himself his how however hundred
i if in indeed into is it its itself
keep
last latter latterly least less
just
made make many may me meanwhile might mine more moreover most mostly move much
must my myself
name namely neither never nevertheless next nine no nobody none noone nor not
nothing now nowhere
of off often on once one only onto or other others otherwise our ours ourselves
out over own
part per perhaps please put
quite
rather re really regarding
same say see seem seemed seeming seems serious several she should show side
since six sixty so some somehow someone something sometime sometimes somewhere
still such
take ten than that the their them themselves then thence there thereafter
thereby therefore therein thereupon these they third this those though three
through throughout thru thus to together too top toward towards twelve twenty
two
under until up unless upon us used using
various very very via was we well were what whatever when whence whenever where
whereafter whereas whereby wherein whereupon wherever whether which while
whither who whoever whole whom whose why will with within without would
yet you your yours yourself yourselves`;

const tokens = `${deStopwords} ${enStopwords}`.split(/\s+/);
const stopwords = new Set(tokens);

const cleanString = (text) => {
  return text.replace(/[^a-zA-Z äÄöÖüÜß]/g, "");
};

const getKeywordsFromString = (text) => {
  // Check for first chars since they are the most important
  const firstChars = text.slice(0, 50);
  const cleaned = cleanString(firstChars);
  const tokens = cleaned.split(/\s+/);
  return tokens.filter((x) => !stopwords.has(x));
};

export { getKeywordsFromString };
