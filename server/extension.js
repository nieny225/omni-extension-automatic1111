// components/RoopComponent.ts
var RoopComponent = {
  schema: {
    "tags": ["default"],
    "componentKey": "roop",
    "operation": {
      "schema": {
        "title": "Roop",
        "type": "object",
        required: ["source", "init_images"],
        "properties": {
          "prompt": {
            "type": "string",
            "x-type": "text",
            description: "The prompt to use for the image"
          },
          "init_images": {
            "title": "Target images.",
            "x-type": "imageArray",
            "description": "The images in which to replace the faces.Each image will be processed with the same prompt and face indices"
          },
          "replace_faces": {
            "type": "string",
            "x-type": "text",
            "default": "0",
            "description": "Comma separated list of faces to replace. 0 is the first face, 1 is the second face, etc."
          },
          "source": {
            "title": "Source Image",
            "type": "object",
            "x-type": "image",
            "description": "The image to to extract faces from."
          },
          "denoising_strength": {
            "title": "Blend Balance",
            description: "Balance between the two images. Low: Prioritize Source Face, High: Prioritize Target Image (denoising strength)",
            minimum: 1e-3,
            maximum: 1,
            default: 0.05
          }
        }
      },
      "responseTypes": {
        "200": {
          "schema": {
            "required": ["images"],
            "type": "string",
            "properties": {
              "images": {
                "title": "Images",
                "type": "object",
                "x-type": "imageArray",
                "description": "The processed images"
              }
            }
          },
          "contentType": "application/json"
        }
      },
      "method": "X-CUSTOM"
    },
    patch: {
      "title": "Face Swap (Roop)",
      "category": "Image Manipulation",
      "summary": "Resize the image to given width and height using various options.",
      "meta": {
        "source": {
          "summary": "Resize the image to the given dimensions with various options for scaling, fitting, and cropping.",
          links: {
            "Sharp Website": "https://sharp.pixelplumbing.com/",
            "Documentation": "https://sharp.pixelplumbing.com/api-resize",
            "Sharp Github": "https://github.com/lovell/sharp",
            "Support Sharp": "https://opencollective.com/libvips"
          }
        }
      },
      inputs: {
        "prompt": {
          placeholder: "Optional prompt. Uses CLIP for auto prompt if left blank."
        },
        "negative_prompt": {
          placeholder: "Optional negative prompt",
          type: "string",
          "x-type": "text"
        },
        "replace_faces": {
          "placeholder": "Which faces (index) to replace, for example: 0 or 1,2"
        },
        "denoising_strength": {
          step: 0.01,
          control: {
            type: "AlpineNumWithSliderComponent"
          }
        },
        "face_restorer": {
          title: "Facial Restoration",
          default: "CodeFormer",
          choices: ["None", "CodeFormer", "GFPGAN"]
        },
        "face_restoration_strength": {
          title: "Restoration Strength",
          type: "float",
          minimum: 0,
          maximum: 1,
          default: 0.5,
          step: 0.01
        },
        "checkpoint": {
          title: "Checkpoint",
          default: "",
          type: "string",
          "x-type": "text"
        },
        "scale_factor": {
          title: "Upscale Factor",
          type: "float",
          minimum: 1,
          maximum: 4,
          default: 1,
          step: 0.01
        },
        "upscaler": {
          title: "Facial Upscaler",
          default: "None",
          choices: [
            "None",
            "Lanczos",
            "Nearest",
            "BSRGAN",
            "LDSR",
            "ESRGAN_4x",
            "R-ESRGAN 2x+",
            "R-ESRGAN 4x+",
            "R-ESRGAN 4x+ Anime6B",
            "R-ESRGAN AnimeVideo",
            "R-ESRGAN General 4xV3",
            "R-ESRGAN General WDN 4xV3",
            "SwinIR_4x",
            "ScuNET PSNR",
            "ScuNet"
          ]
        },
        "source": {
          "type": "object",
          "x-type": "image",
          "required": true,
          "title": "Face Image",
          "description": "Image containing a the face to replace in the target image.",
          control: {
            type: "AlpineLabelComponent"
          }
        }
      },
      controls: {
        preview: {
          type: "AlpineImageGalleryComponent",
          displays: "output:images"
        }
      },
      outputs: {
        "images": {
          "type": "object",
          "x-type": "imageArray",
          "title": "Output Images",
          "description": "The resized images."
        }
      }
    }
  },
  functions: {
    _exec: async (payload, ctx) => {
      var _a;
      const componentService = ctx.app.services.get("componentService");
      let source = payload.source;
      let init_images = payload.init_images || [];
      let sourceB64 = (await ctx.app.cdn.get(source.ticket)).asBase64();
      let resultImages = [];
      for (let i = 0; i < init_images.length; i++) {
        let img2imgOpts = {};
        let negative_prompt = payload.negative_prompt;
        let block = "automatic1111.simpleImage2Image";
        let target = init_images[i];
        let meta = target.meta;
        let targetB64 = (await ctx.app.cdn.get(target.ticket)).asBase64();
        negative_prompt = negative_prompt || meta.sd?.negativePrompt;
        img2imgOpts = {
          width: meta.width,
          height: meta.height,
          prompt: payload.prompt || meta.sd?.prompt || (await componentService.runBlock(ctx, "automatic1111.interrogate", { image: targetB64, model: "clip" })).caption,
          negative_prompt,
          init_images: [targetB64],
          denoising_strength: payload.denoising_strength || 0.05
        };
        let pl = Object.assign(
          {},
          {
            negative_prompt,
            //inpainting_fill: 1,
            //inpaint_full_res: true,
            // "absolutereality_v1-inpainting"
            checkpoint: payload.checkpoint || void 0,
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
                  true
                ]
              }
            }
          },
          img2imgOpts || {}
        );
        console.log(pl.alwayson_scripts.roop);
        const imgResult = (await componentService.runBlock(ctx, block, pl)).images[0];
        if (imgResult) {
          (_a = imgResult.meta).sd ?? (_a.sd = {});
          imgResult.meta.sd.prompt = payload.prompt;
          imgResult.meta.sd.negative_prompt = payload.negative_prompt;
          resultImages.push(imgResult);
        }
      }
      return {
        result: { "ok": true },
        images: resultImages
      };
    }
  }
};
var RoopComponent_default = RoopComponent;

// components.ts
var components = [RoopComponent_default];
var components_default = (FactoryFn) => {
  return components.map((c) => FactoryFn(c.schema, c.functions));
};

// extension.ts
var extensionHooks = {
  "package_installed": (ctx, args) => {
    if (args.omniPackage === "automatic1111") {
    }
  }
};
var extension_default = { hooks: extensionHooks, createComponents: components_default };
export {
  extension_default as default
};
