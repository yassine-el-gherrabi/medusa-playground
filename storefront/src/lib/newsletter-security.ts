/**
 * Newsletter security module — 4 layers of protection.
 *
 * Layer 1: Honeypot (checked in API route)
 * Layer 2: Disposable email blocking
 * Layer 3: In-memory rate limiting (per IP)
 * Layer 4: Strict RFC 5322 email validation
 */

// ---------------------------------------------------------------------------
// Layer 2 — Disposable email domain blocklist
// ---------------------------------------------------------------------------

const DISPOSABLE_DOMAINS = new Set([
  "tempmail.com", "temp-mail.org", "guerrillamail.com", "guerrillamail.net",
  "guerrillamailblock.com", "throwaway.email", "mailinator.com", "maildrop.cc",
  "dispostable.com", "yopmail.com", "yopmail.fr", "sharklasers.com",
  "guerrillamail.info", "grr.la", "guerrillamail.de", "trashmail.com",
  "trashmail.me", "trashmail.net", "10minutemail.com", "10minute.email",
  "minutemail.com", "tempinbox.com", "burnermail.io", "discard.email",
  "mailnesia.com", "mailcatch.com", "jetable.org", "mohmal.com",
  "getnada.com", "emailondeck.com", "temp-mail.io", "fakeinbox.com",
  "tempail.com", "tempr.email", "tempmailaddress.com", "tempmailo.com",
  "crazymailing.com", "harakirimail.com", "mytemp.email", "throwawaymail.com",
  "trash-mail.com", "mailnull.com", "spamfree24.org", "spamgourmet.com",
  "mailexpire.com", "mailmoat.com",
  "filzmail.com", "mailseal.de", "spambox.us", "lroid.com",
  "safetymail.info", "trashymail.com", "trashymail.net", "mailtemp.info",
  "inboxalias.com", "mailnator.com", "bugmenot.com", "deadaddress.com",
  "despammed.com", "devnullmail.com", "dodgeit.com", "dodgit.com",
  "dontreg.com", "e4ward.com", "emailigo.de", "emailwarden.com",
  "enterto.com", "eyepaste.com", "fastacura.com",
  "fizmail.com", "getonemail.com", "getonemail.net",
  "gishpuppy.com", "great-host.in", "greensloth.com", "haltospam.com",
  "hotpop.com", "ieatspam.eu", "ieatspam.info", "imails.info",
  "inboxclean.com", "inboxclean.org", "incognitomail.com", "incognitomail.net",
  "ipoo.org", "irish2me.com", "jetable.com", "jetable.fr.nf",
  "jetable.net", "jnxjn.com", "kasmail.com", "killmail.com",
  "killmail.net", "klzlk.com", "koszmail.pl", "kurzepost.de",
  "lifebyfood.com", "lookugly.com", "lr78.com", "maileater.com",
  "mailin8r.com", "mailinator.net", "mailinator2.com",
  "mailincubator.com", "mailme.ir", "mailme.lv", "mailmetrash.com",
  "mailshell.com", "mailsiphon.com", "mailzilla.com",
  "mailzilla.org", "mbx.cc", "meltmail.com",
  "mintemail.com", "moburl.com", "moncourrier.fr.nf", "monemail.fr.nf",
  "monmail.fr.nf", "mt2015.com", "mx0.wwwnew.eu", "mypartyclip.de",
  "myphantom.com", "mysamp.de", "mytempemail.com", "mytrashmail.com",
  "nabala.com", "nepwk.com", "nervmich.net", "nervtansen.de",
  "netmails.com", "netmails.net", "neverbox.com", "no-spam.ws",
  "nobulk.com", "noclickemail.com", "nogmailspam.info", "nomail.xl.cx",
  "nomail2me.com", "nomorespamemails.com", "nospam.ze.tc", "nospam4.us",
  "nospamfor.us", "nospamthanks.info", "nothingtoseehere.ca",
  "nowmymail.com", "nurfuerspam.de", "nwldx.com",
  "objectmail.com", "obobbo.com", "odnorazovoe.ru", "oneoffemail.com",
  "onewaymail.com", "oopi.org", "ordinaryamerican.net", "owlpic.com",
  "pjjkp.com", "plexolan.de", "pookmail.com", "privacy.net",
  "proxymail.eu", "prtnx.com", "putthisinyouremail.com", "qq.com",
  "quickinbox.com", "rcpt.at", "reallymymail.com", "recode.me",
  "regbypass.com", "rhyta.com", "rklips.com", "rmqkr.net",
  "royal.net", "rtrtr.com", "s0ny.net", "safe-mail.net",
  "safersignup.de", "safetypost.de", "sandelf.de", "saynotospams.com",
  "scatmail.com", "schafmail.de", "selfdestructingmail.com", "sendspamhere.com",
  "shiftmail.com", "shitmail.me", "shortmail.net", "sibmail.com",
  "skeefmail.com", "slaskpost.se", "slipry.net", "slopsbox.com",
  "slowslow.de", "smuggler.com", "snakemail.com", "sneakemail.com",
  "snkmail.com", "sofort-mail.de", "sogetthis.com", "soodonims.com",
  "spam.la", "spam.su", "spamavert.com", "spambob.com",
  "spambob.net", "spambob.org", "spambog.com", "spambog.de",
  "spambog.ru", "spamcannon.com", "spamcannon.net", "spamcero.com",
  "spamcon.org", "spamcorptastic.com", "spamcowboy.com", "spamcowboy.net",
  "spamcowboy.org", "spamday.com", "spamex.com", "spamfighter.cf",
  "spamfighter.ga", "spamfighter.gq", "spamfighter.ml", "spamfighter.tk",
  "spamfree.eu", "spamfree24.com", "spamfree24.de", "spamfree24.eu",
  "spamfree24.info", "spamfree24.net", "spamhole.com",
  "spamify.com", "spaminator.de", "spamkill.info", "spaml.com",
  "spaml.de", "spammotel.com", "spamobox.com", "spamoff.de",
  "spamslicer.com", "spamspot.com", "spamstack.net", "spamthis.co.uk",
  "spamtrail.com", "spamtrap.ro", "speed.1s.fr", "sry.li",
  "stuffmail.de", "supergreatmail.com", "supermailer.jp", "suremail.info",
  "svk.jp", "sweetxxx.de", "tafmail.com", "tagyoureit.com",
  "teleworm.com", "teleworm.us",
  "tempalias.com", "tempe4mail.com", "tempemail.biz",
  "tempemail.co.za", "tempemail.com", "tempemail.net", "tempinbox.co.uk",
  "tempmail.it", "tempmail.us", "tempmail2.com",
  "tempmaildemo.com", "tempmailer.com", "tempmailer.de", "tempomail.fr",
  "temporarioemail.com.br", "temporaryemail.net", "temporaryemail.us",
  "temporaryforwarding.com", "temporaryinbox.com", "temporarymailaddress.com",
  "thankyou2010.com", "thisisnotmyrealemail.com", "throwawayemailaddress.com",
  "tittbit.in", "tizi.com", "tmailinator.com", "toiea.com",
  "tradermail.info", "trash2009.com", "trash2010.com", "trash2011.com",
  "trashdevil.com", "trashdevil.de", "trashemail.de", "trashmail.at",
  "trashmail.io", "trashmail.org", "trashmailer.com",
  "turual.com", "twinmail.de", "tyldd.com", "uggsrock.com",
  "upliftnow.com", "uplipht.com", "venompen.com", "veryreallytrue.com",
  "vidchart.com", "viditag.com", "viewcastmedia.com", "viewcastmedia.net",
  "viewcastmedia.org", "vomoto.com", "vpn.st", "vsimcard.com",
  "vubby.com", "wasteland.rfc822.org", "webemail.me", "weg-werf-email.de",
  "wegwerfadresse.de", "wegwerfemail.com", "wegwerfemail.de", "wegwerfmail.de",
  "wegwerfmail.info", "wegwerfmail.net", "wegwerfmail.org", "wh4f.org",
  "whyspam.me", "wickmail.net", "wilemail.com", "willhackforfood.biz",
  "willselfdestruct.com", "winemaven.info", "wronghead.com", "wuzup.net",
  "wuzupmail.net", "wwwnew.eu", "xagloo.com", "xemaps.com",
  "xents.com", "xjoi.com", "xmaily.com", "xoxy.net",
  "yapped.net", "yep.it", "yogamaven.com",
  "yopmail.gq", "yopmail.net", "ypmail.webarnak.fr.eu.org",
  "yuurok.com", "zehnminutenmail.de", "zippymail.info", "zoaxe.com",
  "zoemail.org",
])

/**
 * Check whether the email uses a known disposable/temporary domain.
 * Returns `true` if the domain is disposable (should be rejected).
 */
export function isDisposableEmail(email: string): boolean {
  const domain = email.split("@")[1]?.toLowerCase()
  if (!domain) return true
  return DISPOSABLE_DOMAINS.has(domain)
}

// ---------------------------------------------------------------------------
// Layer 3 — In-memory rate limiter (per IP, resets on redeploy)
// ---------------------------------------------------------------------------

const rateLimitMap = new Map<string, { count: number; resetAt: number }>()

const RATE_LIMIT_MAX = 3
const RATE_LIMIT_WINDOW_MS = 60_000 // 1 minute

/**
 * Check whether the given IP has exceeded the newsletter submission rate limit.
 * Allows {@link RATE_LIMIT_MAX} requests per {@link RATE_LIMIT_WINDOW_MS}.
 */
export function checkRateLimit(ip: string): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const entry = rateLimitMap.get(ip)

  if (!entry || now > entry.resetAt) {
    rateLimitMap.set(ip, { count: 1, resetAt: now + RATE_LIMIT_WINDOW_MS })
    return { allowed: true }
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return { allowed: false, retryAfter: Math.ceil((entry.resetAt - now) / 1000) }
  }

  entry.count++
  return { allowed: true }
}

// Prevent memory leak — purge expired entries every 5 minutes
if (typeof setInterval !== "undefined") {
  setInterval(() => {
    const now = Date.now()
    for (const [key, value] of rateLimitMap.entries()) {
      if (now > value.resetAt) rateLimitMap.delete(key)
    }
  }, 300_000)
}

// ---------------------------------------------------------------------------
// Layer 4 — Strict email validation (RFC 5322 simplified)
// ---------------------------------------------------------------------------

/** RFC 5322 compliant email regex (simplified but strict) */
const EMAIL_REGEX =
  /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*\.[a-zA-Z]{2,}$/

/**
 * Validate an email address against RFC 5322 rules.
 * Checks format, length constraints, and structural rules.
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== "string") return false
  if (email.length < 5 || email.length > 254) return false
  if (!EMAIL_REGEX.test(email)) return false

  const [local, domain] = email.split("@")
  if (!local || !domain) return false
  if (local.length > 64) return false
  if (domain.length > 253) return false

  // No consecutive dots
  if (email.includes("..")) return false

  return true
}
