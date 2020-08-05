import { addMessages, init, getLocaleFromNavigator } from 'svelte-i18n';

/*
const supported = [
  'de',
  'en',
  'es',
  'fa',
  'fr',
  'ga',
  'id',
  'it',
  'kr',
  'pl',
  'pt-br',
  'ro',
  'ru',
  'tr',
  'uk',
  'zh-TW',
];
*/

// de
import de from './config/locales/de.json';
// import deDeFiDaiStats from 'defi18n/de/daistats.json';
// import deDeFiGeneral from 'defi18n/de/general.json';
// import deDeFiMaker from 'defi18n/de/maker.json';

// en
import en from './config/locales/en.json';
// import enDeFiDaiStats from 'defi18n/en/daistats.json';
// import enDeFiGeneral from 'defi18n/en/general.json';
// import enDeFiMaker from 'defi18n/en/maker.json';

// es
import es from './config/locales/es.json';
// import esDeFiDaiStats from 'defi18n/es/daistats.json';
// import esDeFiGeneral from 'defi18n/es/general.json';
// import esDeFiMaker from 'defi18n/es/maker.json';

// fa
import fa from './config/locales/fa.json';
// import faDeFiDaiStats from 'defi18n/fa/daistats.json';
// import faDeFiGeneral from 'defi18n/fa/general.json';
// import faDeFiMaker from 'defi18n/fa/maker.json';

// fr
import fr from './config/locales/fr.json';
// import frDeFiDaiStats from 'defi18n/fr/daistats.json';
// import frDeFiGeneral from 'defi18n/fr/general.json';
// import frDeFiMaker from 'defi18n/fr/maker.json';

// ga
import ga from './config/locales/ga.json';
// import gaDeFiDaiStats from 'defi18n/ga/daistats.json';
// import gaDeFiGeneral from 'defi18n/ga/general.json';
// import gaDeFiMaker from 'defi18n/ga/maker.json';

// id
import id from './config/locales/id.json';
// import idDeFiDaiStats from 'defi18n/id/daistats.json';
// import idDeFiGeneral from 'defi18n/id/general.json';
// import idDeFiMaker from 'defi18n/id/maker.json';

// it
import it from './config/locales/it.json';
// import itDeFiDaiStats from 'defi18n/it/daistats.json';
// import itDeFiGeneral from 'defi18n/it/general.json';
// import itDeFiMaker from 'defi18n/it/maker.json';

// kr
import kr from './config/locales/kr.json';
// import krDeFiDaiStats from 'defi18n/kr/daistats.json';
// import krDeFiGeneral from 'defi18n/kr/general.json';
// import krDeFiMaker from 'defi18n/kr/maker.json';

// pl
import pl from './config/locales/pl.json';
// import plDeFiDaiStats from 'defi18n/pl/daistats.json';
// import plDeFiGeneral from 'defi18n/pl/general.json';
// import plDeFiMaker from 'defi18n/pl/maker.json';

// pt-br
import ptbr from './config/locales/pt-br.json';
// import ptbrDeFiDaiStats from 'defi18n/pt-br/daistats.json';
// import ptbrDeFiGeneral from 'defi18n/pt-br/general.json';
// import ptbrDeFiMaker from 'defi18n/pt-br/maker.json';

// ro
import ro from './config/locales/ro.json';
// import roDeFiDaiStats from 'defi18n/ro/daistats.json';
// import roDeFiGeneral from 'defi18n/ro/general.json';
// import roDeFiMaker from 'defi18n/ro/maker.json';

// ru
import ru from './config/locales/ru.json';
// import ruDeFiDaiStats from 'defi18n/ru/daistats.json';
// import ruDeFiGeneral from 'defi18n/ru/general.json';
// import ruDeFiMaker from 'defi18n/ru/maker.json';

// tr
import tr from './config/locales/tr.json';
// import trDeFiDaiStats from 'defi18n/tr/daistats.json';
// import trDeFiGeneral from 'defi18n/tr/general.json';
// import trDeFiMaker from 'defi18n/tr/maker.json';

// uk
import uk from './config/locales/uk.json';
// import ukDeFiDaiStats from 'defi18n/uk/daistats.json';
// import ukDeFiGeneral from 'defi18n/uk/general.json';
// import ukDeFiMaker from 'defi18n/uk/maker.json';

// zh-TW
import zhTW from './config/locales/zh-TW.json';
// import zhTWDeFiDaiStats from 'defi18n/zh-TW/daistats.json';
// import zhTWDeFiGeneral from 'defi18n/zh-TW/general.json';
// import zhTWDeFiMaker from 'defi18n/zh-TW/maker.json';

// // de
// addMessages('de', de);
// addMessages('de', deDeFiDaiStats);
// addMessages('de', deDeFiGeneral);
// addMessages('de', deDeFiMaker);

// en
addMessages('en', en);
// addMessages('en', enDeFiDaiStats);
// addMessages('en', enDeFiGeneral);
// addMessages('en', enDeFiMaker);

// // es
// addMessages('es', es);
// addMessages('es', esDeFiDaiStats);
// addMessages('es', esDeFiGeneral);
// addMessages('es', esDeFiMaker);

// // fa
// addMessages('fa', fa);
// addMessages('fa', faDeFiDaiStats);
// addMessages('fa', faDeFiGeneral);
// addMessages('fa', faDeFiMaker);

// // fr
// addMessages('fr', fr);
// addMessages('fr', frDeFiDaiStats);
// addMessages('fr', frDeFiGeneral);
// addMessages('fr', frDeFiMaker);

// // ga
// addMessages('ga', ga);
// addMessages('ga', gaDeFiDaiStats);
// addMessages('ga', gaDeFiGeneral);
// addMessages('ga', gaDeFiMaker);

// // id
// addMessages('id', id);
// addMessages('id', idDeFiDaiStats);
// addMessages('id', idDeFiGeneral);
// addMessages('id', idDeFiMaker);

// // it
// addMessages('it', it);
// addMessages('it', itDeFiDaiStats);
// addMessages('it', itDeFiGeneral);
// addMessages('it', itDeFiMaker);

// // kr
// addMessages('kr', kr);
// addMessages('kr', krDeFiDaiStats);
// addMessages('kr', krDeFiGeneral);
// addMessages('kr', krDeFiMaker);

// // pl
// addMessages('pl', pl);
// addMessages('pl', plDeFiDaiStats);
// addMessages('pl', plDeFiGeneral);
// addMessages('pl', plDeFiMaker);

// // ptbr
// addMessages('pt-br', ptbr);
// addMessages('pt-br', ptbrDeFiDaiStats);
// addMessages('pt-br', ptbrDeFiGeneral);
// addMessages('pt-br', ptbrDeFiMaker);

// // ro
// addMessages('ro', ro);
// addMessages('ro', roDeFiDaiStats);
// addMessages('ro', roDeFiGeneral);
// addMessages('ro', roDeFiMaker);

// // ru
// addMessages('ru', ru);
// addMessages('ru', ruDeFiDaiStats);
// addMessages('ru', ruDeFiGeneral);
// addMessages('ru', ruDeFiMaker);

// // tr
// addMessages('tr', tr);
// addMessages('tr', trDeFiDaiStats);
// addMessages('tr', trDeFiGeneral);
// addMessages('tr', trDeFiMaker);

// // uk
// addMessages('uk', uk);
// addMessages('uk', ukDeFiDaiStats);
// addMessages('uk', ukDeFiGeneral);
// addMessages('uk', ukDeFiMaker);

// // zh-TW
// addMessages('zh-TW', zhTW);
// addMessages('zh-TW', zhTWDeFiDaiStats);
// addMessages('zh-TW', zhTWDeFiGeneral);
// addMessages('zh-TW', zhTWDeFiMaker);

init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator(),
});