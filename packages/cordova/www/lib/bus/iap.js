import { ChannelServer } from '@kano/web-bus/esm/server.js';
import { IAPChannelId, IAPMethods } from '@kano/web-bus/esm/apis/iap/definition.js';

export class IAPServer extends ChannelServer {
    constructor(bus) {
        super(bus, IAPChannelId);

        this.listen(IAPMethods.GET_PRODUCTS, (req) => {
            const defs = req.params[0];
            const reg = new Map();
            defs.forEach((d) => {
                reg.set(d.info.appStore, d);
            });
            return inAppPurchase.getProducts(defs.map(d => d.info.appStore))
                .then((products) => {
                    return products.map((p) => {
                        const src = reg.get(p.productId);
                        return {
                            type: src.info.type,
                            id: src.id,
                            title: p.title,
                            description: p.description,
                            price: p.price,
                            currency: p.currency,
                            priceAsDecimal: p.priceAsDecimal,
                        };
                    });
                });
        });

        this.listen(IAPMethods.BUY, (req) => {
            const [product] = req.params;
            return inAppPurchase.buy(product.info.appStore)
                .then((f) => {
                    return {
                        productId: product.id,
                        id: f.transactionId,
                        receipt: f.receipt,
                        signature: f.signature,
                        productType: f.productType,
                    };
                });
        });

        this.listen(IAPMethods.RESTORE, (req) => {
            const [regs] = req.params;
            const products = new Map();
            Object.keys(regs).forEach((k) => {
                products.set(regs[k].info.appStore, regs[k]);
            });
            return inAppPurchase.restorePurchases()
                .then((ps) => {
                    return ps.map((p) => {
                        const src = products.get(p.productId);
                        if (!src) {
                            return null;
                        }
                        return {
                            id: p.transactionId,
                            productId: src.id,
                            receipt: p.receipt,
                            signature: p.signature,
                            productType: p.productType,
                        };
                    }).filter(t => !!t);
                });
        });

        this.listen(IAPMethods.CONSUME, (req) => {
            const [product, transaction] = req.params;
            return inAppPurchase.consume(product.info.appStore, transaction.receipt, transaction.signature);
        });
    }
}
