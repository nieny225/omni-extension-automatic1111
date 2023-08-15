//import RoopComponent from './components/RoopComponent'
import PromptComponent from './components/PromptComponent'
import LoraComponent from './components/LoraComponent'
import RoopComponent from './components/RoopComponent'
let components = [RoopComponent, PromptComponent, LoraComponent]


export default () =>
{
  return {
    blocks: components,
    patches: []
  }
}



