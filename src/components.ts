//import RoopComponent from './components/RoopComponent'
import PromptComponent from './components/PromptComponent'
import RoopComponent from './components/RoopComponent'
import LoraComponent from './components/LoraComponent'
let components = [PromptComponent, LoraComponent, RoopComponent]


export default () =>
{
  return {
    blocks: components,
    patches: []
  }
}



