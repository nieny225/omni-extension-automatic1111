/**
 * Copyright (c) 2023 MERCENARIES.AI PTE. LTD.
 * All rights reserved.
 */

import { OAIBaseComponent, WorkerContext, OmniComponentMacroTypes } from 'omni-sockets'

const NS_OMNI = 'automatic1111'

// SharpCompositeComponent
let component = OAIBaseComponent
  .create(NS_OMNI, 'lora')
  .fromScratch()
  .set('description', 'A component to add a lora')
  .set('title', 'Lora (automatic1111)')
  .set('category', 'Image Generation')
  .setMethod('X-CUSTOM')
  .setMeta({
      source: {
        summary: 'Lora Support for  automatic1111.',
        authors: ['georg zoeller/mercenaries.ai'],
        links: {
          'automatic1111': 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
          'sd-next': 'https://github.com/vladmandic/automatic'
        }
      }
  })
component
  .addControl(component.createControl('lora')
    .set('description', 'The lora to add')
    .set('title', 'Lora')
    .setRequired(true)
    .setChoices({
      block: "automatic1111.getLoras",
      cache: "global",
      map:{
        title: "name",
        value: "name"
      }
    })
    .toOmniControl()
  )

  .addInput(
    component.createInput('strength', 'number')
      .set('description', 'The lora strength')
      .setConstraints(-8,8,0.1)
      .setDefault(0.5)
      .toOmniIO()
  )

  .addOutput(
    component.createOutput('lora', 'object')
      .set('description', 'The constructed object')
      .toOmniIO()
  )

  .setMacro(OmniComponentMacroTypes.EXEC, async (payload: any, ctx: WorkerContext) => {

    let { lora, strength } = payload

    let ret = {}
    ret[lora] = strength
    return {
      lora: ret
    }


  })
const PromptComponent = component.toJSON()
export default PromptComponent
