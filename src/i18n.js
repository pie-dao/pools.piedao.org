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
// en
import en from './config/locales/en.json';

// es
import es from './config/locales/es.json';
// fa
import fa from './config/locales/fa.json';
// import fr from './config/locales/fr.json';

// ga
import ga from './config/locales/ga.json';

// id
import id from './config/locales/id.json';

// it
import it from './config/locales/it.json';

// kr
import kr from './config/locales/kr.json';

// pl
import pl from './config/locales/pl.json';

// pt-br
import ptbr from './config/locales/pt-br.json';

// ro
import ro from './config/locales/ro.json';

// ru
import ru from './config/locales/ru.json';

// tr
import tr from './config/locales/tr.json';

// uk
import uk from './config/locales/uk.json';

// zh-TW
import zhTW from './config/locales/zh-TW.json';
// // de
addMessages('de', de);

// en
addMessages('en', en);

// es
addMessages('es', es);

// fa
addMessages('fa', fa);

// fr
// addMessages('fr', fr);

// ga
addMessages('ga', ga);

// id
addMessages('id', id);

// it
addMessages('it', it);

// kr
addMessages('kr', kr);
// pl
addMessages('pl', pl);

// ptbr
addMessages('pt-br', ptbr);

// ro
addMessages('ro', ro);

// ru
addMessages('ru', ru);

// tr
addMessages('tr', tr);
// uk
addMessages('uk', uk);
// zh-TW
addMessages('zh-TW', zhTW);

init({
  fallbackLocale: 'en',
  initialLocale: getLocaleFromNavigator(),
});
