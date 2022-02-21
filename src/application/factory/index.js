import ApplicationServiceFactory from '../services/factory/index.js';

class ApplicationLayerFactory {
  static make(deps, config) {
    if (!deps) {
      return { applicationLayer: { services: {} } };
    }

    const resolvedDeps = {
      applicationLayer: {
        services: Object.values(deps.applicationLayer.services)
          .map(dep => ({ [dep]: ApplicationServiceFactory[dep](config) }))
          .reduce((previous, current) => ({ ...previous, ...current }), {}),
      },
    };

    return resolvedDeps;
  }
}

export default ApplicationLayerFactory;
