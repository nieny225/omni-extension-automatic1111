import { OAIBaseComponent, WorkerContext, OmniComponentMacroTypes } from 'omni-sockets'

const NS_OMNI = 'automatic1111'

// SharpCompositeComponent
let component = OAIBaseComponent
  .create(NS_OMNI, 'prompt')
  .fromScratch()
  .set('description', 'A component to create prompts in automatic1111 format')
  .set('title', 'Prompt (automatic1111)')
  .set('category', 'Image Generation')
  .setMethod('X-CUSTOM')
  .setMeta({
      source: {
        summary: 'Create Prompts for Stable Diffusion automatic1111.',
        authors: ['georg zoeller/mercenaries.ai'],
        links: {
          'automatic1111': 'https://github.com/AUTOMATIC1111/stable-diffusion-webui',
          'sd-next': 'https://github.com/vladmandic/automatic'
        }
      }
  })
component
  .addInput(
    component.createInput('prompt', 'string', 'text')
      .set('description', 'The raw prompt text')
      .setRequired(true)
      .toOmniIO()
  )
  .addInput(
    component.createInput('negative_prompt', 'string', 'text')
      .set('description', 'The raw prompt text')
      .toOmniIO()
  )
  .addInput(
    component.createInput('model', 'string', 'text')
      .set('description', 'the model used')
      .toOmniIO()
  )
  .addInput(
    component.createInput('prompt_template', 'string', 'text')
      .set('description', 'The raw prompt text')
      .setDefault('{{PROMPT}} {{LORAS}} {{TEXTUAL_INVERSION}} {{MODEL_KEYWORD}}')
      .toOmniIO()
  )
  .addInput(
    component.createInput('LORAS', 'array', 'objectArray')
      .set('description', 'Loras')
      .setRequired(true)
      .allowMultiple()
      .toOmniIO()
  )
  .addOutput(
    component.createOutput('prompt', 'string', 'text')
      .set('description', 'The constructed prompt')
      .toOmniIO()
  )
  .addOutput(
    component.createOutput('negative_prompt', 'string', 'text')
      .set('description', 'The constructed negative prompt')
      .toOmniIO()
  )
  .setMacro(OmniComponentMacroTypes.EXEC, async (payload: any, ctx: WorkerContext) => {

    let { prompt, negative_prompt, prompt_template, LORAS } = payload



    prompt = prompt_template.replace('{{PROMPT}}', prompt)

    console.log(LORAS)
    if (LORAS.length > 0)
    {
      LORAS = Object.assign({}, ...LORAS)
      LORAS = Object.entries(LORAS).map(([key, value]) => `<lora:${key}:${value}>`).join(',')
    }

    prompt = prompt.replace('{{LORAS}}', LORAS)
    prompt = prompt.replace('{{TEXTUAL_INVERSION}}', '')
    prompt = prompt.replace('{{MODEL_KEYWORD}}', '')

    negative_prompt = prompt_template.replace('{{PROMPT}}', negative_prompt)
    negative_prompt = negative_prompt.replace('{{LORAS}}', '')
    negative_prompt = negative_prompt.replace('{{TEXTUAL_INVERSION}}', '')
    negative_prompt = negative_prompt.replace('{{MODEL_KEYWORD}}', '')

    return { prompt, negative_prompt}


  })
const PromptComponent = component.toJSON()
export default PromptComponent
