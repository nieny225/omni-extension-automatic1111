
import CreateComponents from './components'






const extensionHooks = {

  'package_installed': (ctx,args) =>  //{ omniPackage:string, installationId, orgId, customBaseUrl, duration: (end - start).toFixed(1) })
  {
    if (args.omniPackage === 'automatic1111')
    {



    }
  }


}

export default {hooks: extensionHooks, createComponents: CreateComponents}



