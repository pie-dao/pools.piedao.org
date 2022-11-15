import { writable } from 'svelte/store';

import pools from '../config/pools.json';

import NotFound from '../pages/NotFound.svelte';
import Pool from '../pages/Pool.svelte';
import Main from '../pages/landings/Main.svelte';
import Tokensswap from '../pages/Tokensswap.svelte';
import Migration from '../pages/Migrations.svelte';
import Dough from '../pages/Dough.svelte';
import DoughStakingCampaign from '../pages/DoughStakingCampaign.svelte';
import KpiOptionsCampaign from '../pages/KpiOptionsCampaign.svelte';
import Dashboard from '../pages/Dashboard.svelte';
import LPStaking from '../pages/LPStaking.svelte';
import LPStakingV2 from '../pages/LPStakingV2.svelte';
import Staking from '../pages/Staking.svelte';
import Slice from '../pages/Slice.svelte';
import StakingPageSingle from '../pages/StakingPageSingle.svelte';
import Markets from '../pages/Markets.svelte';
import DefiPie from '../pages/landings/defiPie.svelte';
import About from '../pages/landings/about.svelte';
import Oven from '../pages/landings/oven.svelte';
import Experipie from '../pages/ExperiPie.svelte';
import PiePageSwitch from '../pages/PiePageSwitch.svelte';
import Learn from '../pages/Learn.svelte';
import Integrations from '../pages/Integrations.svelte';
import Piefolio from '../pages/Piefolio.svelte';
import DoughStaking from '../pages/DoughStaking.svelte';
import StakingPositions from '../pages/StakingPositions.svelte';
import StakingRewards from '../pages/StakingRewards.svelte';
import StakingRewardBreakdown from '../pages/StakingRewardBreakdown.svelte';
import StakingCharts from '../pages/charts/StakingCharts.svelte';
import Farm from '../pages/Farm.svelte';
import Simulator from '../pages/simulator/Simulator.svelte';
import SimulatorStats from '../pages/simulator/Stats.svelte';
import MigrationPage from '../pages/MigrationPage.svelte';
import BuyBackDough from '../pages/BuyBackDough.svelte';
import BuyBackEdough from '../pages/BuyBackEdough.svelte';
import eDoughToVeDough from '../pages/eDoughToVeDough.svelte';

export const defaultRouteObj = {
  page: Main,
  params: {
    address: pools.default,
  },
};

const deriveRoute = () => {
  try {
    if (window.location.hash === '') {
      const normal = window.location.pathname.split('/');
      const path = normal.filter((part) => part && part.length > 0);
      if (path.length > 0) return path;
    }

    const core = window.location.href.split('#')[1];

    if (!core) {
      return [];
    }

    const parts = core.split('/').filter((part) => part && part.length > 0);

    return parts;
  } catch (e) {
    return [];
  }
};
/*
function changeUrl(routes) {
  if (typeof history.pushState !== 'undefined') {
    let url = '/';
    routes.forEach((part) => {
      url += `${part}/`;
    });
    window.history.pushState({}, '', url);
  } else {
    window.location.assign(url);
  }
}
*/
const formatRoute = (route) => {
  let address;
  let poolAction;
  let referral;
  let method;

  const _route = route ? [...route] : [];
  console.log('formatRoute before -> _route', _route, route);
  if (_route) {
    for (let i = 0; i < _route.length; i += 1) {
      if (_route[i] && _route[i].indexOf('?') >= 0) {
        _route[i] = _route[i].substring(0, _route[i].indexOf('?'));
      }
    }
  }

  console.log('formatRoute after -> _route', _route);
  const notFound = { page: NotFound, params: { path: `/${route.join('/')}` } };

  // changeUrl(route);

  switch (_route[0] || 'root') {
    case 'about':
      return { page: About };
    case 'dxp-defi-index':
      return { page: DefiPie };
    case 'markets':
      return { page: Markets };
    case 'pies':
      return { page: Dashboard };
    case 'exp':
      address = (_route[1] || '0x992e9f1d29e2fdb57a9e09a78e122fafe3720cc5').toLowerCase();
      return { page: Experipie, params: { address } };
    case 'slice':
      return { page: Slice };
    case 'pie':
      address = (_route[1] || '').toLowerCase();
      return { page: PiePageSwitch, params: { address } };
    case 'dough-staking-campaign':
      return { page: DoughStakingCampaign };
    case 'kpi-options-campaign':
      return { page: KpiOptionsCampaign };
    case 'dough':
      return { page: Dough };
    case 'learn':
      return { page: Learn };
    case 'integrations':
      return { page: Integrations };
    case 'swap':
      return { page: Tokensswap };
    case 'migrate':
      return { page: Migration, params: { address } };
    case 'oven':
      return { page: Oven };
    case 'piefolio':
      return { page: Piefolio };
    case 'farms':
      return { page: LPStakingV2 };
    case 'farm':
      return { page: Farm };
    case 'dough-staking':
      return { page: DoughStaking };
    case 'buyback':
      return { page: MigrationPage };
    case 'buyback-dough':
      return { page: BuyBackDough };
    case 'buyback-edough':
      return { page: BuyBackEdough };
    case 'edough-to-vedough':
      return { page: eDoughToVeDough };
    case 'staking_positions':
      return { page: StakingPositions };
    case 'staking_rewards':
      return { page: StakingRewards };
    case 'staking_reward_breakdown':
      /* eslint-disable no-case-declarations */
      const timestamp = _route[1] || '';
      /* eslint-enable no-case-declarations */
      return { page: StakingRewardBreakdown, params: { timestamp } };
    case 'simulator':
    case 'staking-simulator':
      /* eslint-disable no-case-declarations */
      const simulation = _route[1] || '';
      /* eslint-enable no-case-declarations */
      return { page: Simulator, params: { simulation } };
    case 'simulator-stats':
      return { page: SimulatorStats };
    case 'staking':
      return _route[1] ? { page: StakingPageSingle, params: _route } : { page: Staking };
    case 'staking-charts':
      return { page: StakingCharts };
    case 'pools':
      address = (_route[1] || '').toLowerCase();
      poolAction = (_route[2] || 'add').toLowerCase();
      method = (_route[3] || 'single').toLowerCase();

      if (pools.available.includes(address)) {
        return { page: Pool, params: { address, poolAction, method } };
      }
      break;
    /*
    case 'oven':
      address = (route[1] || '').toLowerCase();
      poolAction = (route[2] || 'add').toLowerCase();
      method = (route[3] || 'single').toLowerCase();

      if (pools.available.includes(address)) {
        return { page: Oven, params: { address, poolAction, method } };
      }

      break;
*/
    case 'root':
      return defaultRouteObj;
    default:
      return notFound;
  }

  return notFound;
};

const route = deriveRoute();
console.log('deriveRoute -> route', route);

export const currentRoute = writable({ ...formatRoute(route) });

window.addEventListener('hashchange', () => {
  const newRoute = deriveRoute();
  const trackPath = `/${newRoute.join('/')}`;

  if (window.location.origin !== 'http://localhost:8080' && window.gtag) {
    window.gtag('event', 'page_view', {
      page_path: trackPath,
    });
  } else {
    console.log('Routes Analytics DEV', {
      page_path: trackPath,
    });
  }

  currentRoute.set({ ...formatRoute(newRoute) });
  window.scrollTo({
    top: 0,
    left: 0,
    behavior: 'smooth',
  });
});
