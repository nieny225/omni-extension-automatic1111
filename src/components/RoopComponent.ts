
// const RoopComponent =
// {
//   schema:
//   {
//     "tags": ['default'],
//     "componentKey": "roop",
//     "operation": {
//       "schema": {
//         "title": "Roop",
//         "type": "object",
//         required:[ "source", "init_images"],
//         "properties": {
//           "prompt":
//           {
//             "type": "string",
//             "x-type": "text",
//             description: "The prompt to use for the image"
//           },
//           "init_images":
//           {
//             "title": "Target images.",
//             "x-type": "imageArray",
//             "description": "The images in which to replace the faces.Each image will be processed with the same prompt and face indices"
//           },
//           "replace_faces":
//           {
//             "type": "string",
//             "x-type": "text",
//             "default": "0",
//             "description": "Comma separated list of faces to replace. 0 is the first face, 1 is the second face, etc."
//           },
//           "source": {
//             "title": "Source Image",
//             "type": "object",
//             "x-type": "image",
//             "description": "The image to to extract faces from."
//           },
//           "denoising_strength":
//           {
//             "title": "Blend Balance",
//             description: "Balance between the two images. Low: Prioritize Source Face, High: Prioritize Target Image (denoising strength)",
//             minimum: 0.001,
//             maximum: 1,
//             default: 0.05
//           }

//         },
//       },
//       "responseTypes": {
//         "200": {
//           "schema": {
//             "required": ["images"],
//             "type": "string",
//             "properties": {
//               "images": {
//                 "title": "Images",
//                 "type": "object",
//                 "x-type": "imageArray",
//                 "description": "The processed images"
//               }
//             },
//           },
//           "contentType": "application/json"
//         },
//       },
//       "method": "X-CUSTOM"
//     },
//     patch: {
//       "title": "Face Swap (Roop)",
//       "category": "Image Manipulation",
//       "summary": "Resize the image to given width and height using various options.",
//       "meta": {
//         "source": {
//           "summary": "Resize the image to the given dimensions with various options for scaling, fitting, and cropping.",
//           links: {
//             "Sharp Website": "https://sharp.pixelplumbing.com/",
//             "Documentation": "https://sharp.pixelplumbing.com/api-resize",
//             "Sharp Github": "https://github.com/lovell/sharp",
//             "Support Sharp": "https://opencollective.com/libvips"
//           }
//         },
//       },
//       inputs: {
//         "prompt":
//         {
//           description: "Optional prompt. Uses CLIP for auto prompt if left blank.",
//           default:''
//         },
//         "negative_prompt":
//         {
//           description: "Optional negative prompt",
//           default: '',
//           type: "string",
//           "x-type": "text",
//         },
//         "replace_faces":
//         {
//           "default": '0,1,2,3',
//           "description": 'Which faces to replace'
//         },
//         "denoising_strength":
//         {
//           step: 0.01,
//           control:
//           {
//             type: "AlpineNumWithSliderComponent"
//           }
//         },
//         "face_restorer":
//         {
//           title: "Facial Restoration",
//           default: "CodeFormer",
//           choices:  [ "None", "CodeFormer", "GFPGAN"]
//         },
//         "face_restoration_strength":
//         {
//           title: "Restoration Strength",
//           type: "float",
//           minimum: 0.0,
//           maximum: 1.0,
//           default: 0.5,
//           step: 0.01
//         },
//         checkpoint:
//         {
//           "title": "Model",
//           "x-type": "text",
//           "type": "string",
//           "description": "The checkpoint to use.",
//           "default": "v1-5-pruned-emaonly",            
//           "choices":
//           {
//             "block": "automatic1111.getModels",
//             map:    
//             {

//               "cache": "global",
//               "title": "model_name",
//               "value": "model_name"
//             }
//           }
//         },
      
//         sampler_name:
//         {
//           default: "DPM++ 2M",    
//           "choices":
//           {
//             block: "automatic1111.getSamplers",
//             map:    
//             {

//               "cache": "global",
//               "title": "name",
//               "value": "name",
              
//             }
//           }
//         },
  
//         "scale_factor":
//         {
//           title: "Upscale Factor",
//           type: "float",
//           minimum: 1.0,
//           maximum: 4.0,
//           default: 1.0,
//           step: 0.01
//         },
//         "upscaler":
//         {
//           title: "Facial Upscaler",
//           default: "None",
//           choices:  [
//               "None",
//               "Lanczos",
//               "Nearest",
//               "BSRGAN",
//               "LDSR",
//               "ESRGAN_4x",
//               "R-ESRGAN 2x+",
//               "R-ESRGAN 4x+",
//               "R-ESRGAN 4x+ Anime6B",
//               "R-ESRGAN AnimeVideo",
//               "R-ESRGAN General 4xV3",
//               "R-ESRGAN General WDN 4xV3",
//               "SwinIR_4x",
//               "ScuNET PSNR",
//               "ScuNet"
//             ]
//         },
//         "source": {
//           "type": "object",
//           "x-type": "image",
//           "required": true,
//           "title": "Face Image (Source)",
//           "description": "Image containing a the face to replace in the target image.",
//           control:
//           {
//             type: "AlpineLabelComponent"
//           }
//         },

//       },
//       controls:
//       {
//         preview: {
//           type: "AlpineImageGalleryComponent",
//           displays: "output:images"
//         }
//       },
//       outputs: {
//         "images": {
//           "type": "object",
//           "x-type": "imageArray",
//           "title": "Output Images",
//           "description": "The resized images."
//         }
//       }
//     }
//   },
//   functions: {
//     _exec: async (payload, ctx) =>
//     {

//       const componentService = ctx.app.services.get('componentService')

//       let source = payload.source
//       let init_images = payload.init_images || []
//       let sourceB64 = (await ctx.app.cdn.get(source.ticket)).asBase64()
//       let resultImages = []

//       for (let i = 0; i < init_images.length; i++)
//       {
//         let img2imgOpts= {}
//         let negative_prompt = payload.negative_prompt
//         let block = "automatic1111.simpleImage2Image"
//         let target = init_images[i]
//         let meta = target.meta
//         let targetB64 = (await ctx.app.cdn.get(target.ticket,{},'asBase64'))
//         negative_prompt = negative_prompt || meta.sd?.negativePrompt
//         img2imgOpts = {
//           width: meta.width,
//           height: meta.height,
//           prompt: payload.prompt || meta.sd?.prompt || (await componentService.runBlock(ctx,"automatic1111.interrogate", {image: targetB64, model: 'clip'})).caption,
//           negative_prompt,
//           sampler_name: payload.sampler_name,
//           init_images: [targetB64],
//           denoising_strength: payload.denoising_strength || 0.05,
//         }


//         // If prompt is supplied, use it
//         // If not, but meta data has a prompt, use that
//         // If not, run CLIP to get a prompt


//         // Construct the payload for the stable diffusion block
//         let pl = Object.assign({},
//         {
//           negative_prompt,
//           //inpainting_fill: 1,
//           //inpaint_full_res: true,
//           // "absolutereality_v1-inpainting"
//           checkpoint: payload.checkpoint || undefined,
//           "alwayson_scripts": {
//             "roop": {
//               "args": [
//                 sourceB64,
//                 true,
//                 payload.replace_faces ?? "0",
//                 "../../../models/roop/inswapper_128.onnx",
//                 payload.face_restorer,
//                 payload.face_restoration_strength,
//                 payload.upscaler,
//                 1,
//                 payload.scale_factor,
//                 false,
//                 true,
//               ]
//             }
//           }
//         }, img2imgOpts || {})

//         console.log(pl.alwayson_scripts.roop)
//         const imgResult = (await componentService.runBlock(ctx,block, pl)).images[0]

//         if (imgResult)
//         {

//           imgResult.meta.sd ??= {}
//           imgResult.meta.sd.prompt = payload.prompt
//           imgResult.meta.sd.negative_prompt = payload.negative_prompt

//           resultImages.push(imgResult)
//         }

//       }

//       return  {
//         result: {"ok": true},
//         images: resultImages
//       }

//     }
//   }
// }
// export default RoopComponent
import { OAIBaseComponent, WorkerContext, OmniComponentMacroTypes } from 'mercs_rete'
// import automatic1111 from '../util/automatic1111'
const NS_OMNI = 'omnitool';
let component = OAIBaseComponent
  .create(NS_OMNI, 'roop')
  .fromScratch()
  .set('description', 'Resize the image to the given dimensions with various options for scaling, fitting, and cropping.')
  .set('title', 'Face Swap (Roop)')
  .set('category', 'Image Manipulation')
  .setMethod('X-CUSTOM')
component
  .addInput(
    component.createInput('prompt', 'string', 'text')
      .set('description', 'Optional prompt. Uses CLIP for auto prompt if left blank.')
      .setDefault('')
      .toOmniIO()
  )
  .addInput(
    component.createInput('negative_prompt', 'string', 'text')
      .set('description', 'Optional negative prompt')
      .setDefault('')
      .toOmniIO()
  )
  .addInput(
    component.createInput('replace_faces', 'string', 'text')
      .set('description', 'Which faces to replace')
      .setDefault('0,1,2,3')
      .toOmniIO()
  )
  .addInput(
    component.createInput('denoising_strength', 'float')
      .set('description', 'Balance between the two images. Low: Prioritize Source Face, High: Prioritize Target Image (denoising strength)')
      .setDefault(0.05)
      .setConstraints(0.001, 1, 0.01)
      .setControl({
        controlType: 'AlpineNumWithSliderComponent'
      })
      .toOmniIO()
  ).addInput(
    component.createInput('face_restorer', 'string')
      .set('title', 'Facial Restoration')
      .setDefault('CodeFormer')
      .setChoices(['None', 'CodeFormer', 'GFPGAN'])
      .toOmniIO()
  )
  .addInput(
    component.createInput('checkpoint', 'string', 'text')
      .set('description', 'The checkpoint to use.')
      .setDefault('v1-5-pruned-emaonly')
      .setChoices({
        block: 'automatic1111.getModels',
        map: {
          cache: 'global',
          title: 'model_name',
          value: 'model_name'
        }
      })
      .toOmniIO()
  )
  .addInput(
    component.createInput('sampler_name', 'string')
      .setDefault('DPM++ 2M')
      .setChoices({
        block: 'automatic1111.getSamplers',
        map: {
          cache: 'global',
          title: 'name',
          value: 'name',
        }
      })
      .toOmniIO()
  )
  .addInput(
    component.createInput('scale_factor', 'float')
      .set('title', 'Upscale Factor')
      .setDefault(1.0)
      .setConstraints(1.0, 4.0, 0.01)
      .toOmniIO()
  )
  .addInput(
    component.createInput('upscaler', 'string')
      .set('title', 'Facial Upscaler')
      .setDefault('None')
      .setChoices(['None', 'Lanczos', 'Nearest', 'BSRGAN', 'LDSR', 'ESRGAN_4x', 'R-ESRGAN 2x+', 'R-ESRGAN 4x+', 'R-ESRGAN 4x+ Anime6B', 'R-ESRGAN AnimeVideo', 'R-ESRGAN General 4xV3', 'R-ESRGAN General WDN 4xV3', 'SwinIR_4x', 'ScuNET PSNR', 'ScuNet'])
      .toOmniIO()
  )
  .addInput(
    component.createInput('source', 'object', 'image')
      .set('description', 'Image containing a the face to replace in the target image.')
      .set('title', 'Face Image (Source)')
      .setRequired(true)
      .setControl({
        controlType: 'AlpineLabelComponent'
      })
      .toOmniIO()
  )
  .addInput(
    component.createInput('init_images', 'object', 'imageArray')  
      .set('title', 'Target Image')
      .set('description', 'The image in which to replace the faces. Each image will be processed with the same prompt and face indices')
      .setRequired(true)
      .toOmniIO()
  )
  .addOutput(
    component.createOutput('images', 'object', 'imageArray')
      .set('description', 'The processed images')
      .toOmniIO()
  )
  .setMacro(OmniComponentMacroTypes.EXEC, async (payload: any, ctx: WorkerContext) => {
    const componentService = ctx.app.services.get('componentService')
    let source = payload.source
    let init_images = payload.init_images || []
    let sourceB64 = (await ctx.app.cdn.get(source.ticket)).asBase64()
    let resultImages = []
    for (let i = 0; i < init_images.length; i++) {
      let img2imgOpts= {}
      let negative_prompt = payload.negative_prompt
      let block = automatic1111.simpleImage2Image
      let target = init_images[i]
      let meta = target.meta
      let targetB64 = (await ctx.app.cdn.get(target.ticket,{},'asBase64'))
      negative_prompt = negative_prompt || meta.sd?.negativePrompt

      img2imgOpts = {
        width: meta.width,
        height: meta.height,
        prompt: payload.prompt || meta.sd?.prompt || (await componentService.runBlock(ctx,"automatic1111.interrogate", {image: targetB64, model: 'clip'})).caption,
        negative_prompt,
        sampler_name: payload.sampler_name,
        init_images: [targetB64],
        denoising_strength: payload.denoising_strength || 0.05,
      }

      let pl = Object.assign({}, {
        negative_prompt,
        checkpoint: payload.checkpoint || undefined,
        "alwayson_scripts": {
          "roop": {
            "args": [
              sourceB64,
              true,
              payload.replace_faces ?? "0",
              "../../../models/roop/inswapper_128.onnx",
              payload.face_restorer,
              payload.face_restoration_strength,
              payload.upscaler,
              1,
              payload.scale_factor,
              false,
              true,
            ]
          }
        }
      }, img2imgOpts || {})

      const imgResult = (await componentService.runBlock(ctx,block, pl)).images[0]

      if (imgResult) {
        imgResult.meta.sd ??= {}
        imgResult.meta.sd.prompt = payload.prompt
        imgResult.meta.sd.negative_prompt = payload.negative_prompt
        resultImages.push(imgResult)
      }
    }

    return {images: resultImages}

  })
const RoopComponent = component.toJSON()
export default RoopComponent