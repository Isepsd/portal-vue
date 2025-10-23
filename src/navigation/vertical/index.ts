import type { VerticalNavItems } from '@layouts/types'
import appsAndPages from './apps-and-pages'
import charts from './charts'
import dashboard from './dashboard'
import fasop from './fasop'
import forms from './forms'
import opsisdis from './opsisdis'
import others from './others'
import uiElements from './ui-elements'

export default [...dashboard,...fasop,...opsisdis, ...appsAndPages, ...uiElements, ...forms, ...charts, ...others] as VerticalNavItems
