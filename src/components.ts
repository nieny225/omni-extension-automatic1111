//import RoopComponent from './components/RoopComponent'
import PromptComponent from './components/PromptComponent'
import LoraComponent from './components/LoraComponent'
let components = [PromptComponent, LoraComponent]


export default () =>
{
  return {
    blocks: components,
    patches: []
  }
}



