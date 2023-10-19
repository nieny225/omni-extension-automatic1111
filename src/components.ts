/**
 * Copyright (c) 2023 MERCENARIES.AI PTE. LTD.
 * All rights reserved.
 */


import PromptComponent from './components/PromptComponent'
//import RoopComponent from './components/RoopComponent'
import LoraComponent from './components/LoraComponent'
let components = [PromptComponent, LoraComponent,/* RoopComponent*/]


export default () =>
{
  return {
    blocks: components,
    patches: []
  }
}



