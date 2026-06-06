const fs = require('fs');
const path = require('path');

const files = [
    "pages/api/reviews/[reviewId].js",
    "pages/api/reviews/[reviewId]/helpful.js",
    "pages/api/products/[id]/reviews.js",
    "pages/api/products/[id]/check-purchase.js",
    "pages/api/orders/[id]/pay.js",
    "pages/api/orders/[id]/index.js",
    "pages/api/orders/history.js",
    "pages/api/admin/summary.js",
    "pages/api/admin/users/[id].js",
    "pages/api/admin/trust-badges/[id].js",
    "pages/api/admin/testimonials/[id].js",
    "pages/api/admin/social-proof-stats/[id].js",
    "pages/api/admin/reviews/[reviewId]/status.js",
    "pages/api/admin/reviews/[reviewId]/response.js",
    "pages/api/admin/products/[id].js",
    "pages/api/admin/orders/[id]/pay.js",
    "pages/api/admin/orders/[id]/index.js",
    "pages/api/admin/orders/[id]/deliver.js",
    "pages/api/admin/categories/[id].js",
    "pages/api/keys/paypal.js",
    "pages/api/coupons/apply.js",
    "pages/api/coupons/validate.js",
    "pages/api/coupons/mark-used.js",
    "pages/api/admin/cloudinary-sign.js",
    "pages/api/admin/users/index.js",
    "pages/api/admin/trust-badges/index.js",
    "pages/api/admin/testimonials/index.js",
    "pages/api/admin/social-proof-stats/index.js",
    "pages/api/admin/site-settings/index.js",
    "pages/api/admin/site-settings/reset.js",
    "pages/api/admin/reviews/index.js",
    "pages/api/admin/products/index.js",
    "pages/api/admin/orders/index.js",
    "pages/api/admin/stock-notifications/trigger.js",
    "pages/api/stock-notifications/stats.js",
    "pages/api/admin/categories/index.js",
];

const authImportLine = `import { isAuth, isAdmin } from '@/utils/auth';`;

for (const relPath of files) {
    const fullPath = path.join(process.cwd(), relPath);
    if (!fs.existsSync(fullPath)) continue;

    let content = fs.readFileSync(fullPath, 'utf8');
    const original = content;

    // Remove stale next-auth imports
    content = content.replace(/import \{ getServerSession \} from ['"]next-auth\/next['"];\r?\n/g, '');
    content = content.replace(/import \{ authOptions \} from ['"][^'"]*nextauth[^'"]*['"];\r?\n/g, '');

    // Add isAuth import if not present
    if (!content.includes("from '@/utils/auth'") && !content.includes('from "@/utils/auth"')) {
        content = authImportLine + '\n' + content;
    }

    // Replace admin check pattern: session + !session || !session.user.isAdmin
    content = content.replace(
        /const session = await getServerSession\(req, res, authOptions\);\s*\n\s*if \(!session \|\|[^}]+\}\s*\n/g,
        `let user;\ntry { user = await isAuth(req, res); } catch(e) { return; }\nif (!user.isAdmin) { return res.status(401).send({ message: 'Admin sign in required' }); }\n`
    );

    // Replace simple auth check: session + !session
    content = content.replace(
        /const session = await getServerSession\(req, res, authOptions\);\s*\n\s*if \(!session\) \{[^}]+\}\s*\n(\s*const \{ user \} = session;\s*\n)?/g,
        `let user;\ntry { user = await isAuth(req, res); } catch(e) { return; }\n`
    );

    // Any remaining bare getServerSession
    content = content.replace(
        /const session = await getServerSession\([^)]+\);/g,
        `let user; try { user = await isAuth(req, res); } catch(e) { return; }`
    );

    // Fix remaining session references
    content = content.replace(/session\.user\._id/g, 'user._id');
    content = content.replace(/session\.user\.isAdmin/g, 'user.isAdmin');
    content = content.replace(/session\.user\.email/g, 'user.email');
    content = content.replace(/session\.user\.name/g, 'user.name');
    content = content.replace(/session\.user/g, 'user');
    content = content.replace(/\bsession\b/g, 'user');

    if (content !== original) {
        fs.writeFileSync(fullPath, content, 'utf8');
        console.log('Patched:', relPath);
    }
}

console.log('Done.');
