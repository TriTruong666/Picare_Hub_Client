import { defineConfig, type Plugin } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import JavaScriptObfuscator from 'javascript-obfuscator'
import path from 'path'

const PRIVATE_UI_MODULES = [
  '/src/pages/public/PimoryPage.tsx',
  '/src/components/reactbit/Masonry.tsx',
  '/src/pages/public/CataloguePublicPreviewPage.tsx',
  '/src/pages/public/CataloguePublicGalleryPage.tsx',
  '/src/components/custom_ui/CataloguePageTurnCanvas.tsx',
  '/src/utils/CataloguePageImageCache.ts',
]

function isPrivateUiModule(id: string): boolean {
  const normalizedId = id.split('?')[0].replace(/\\/g, '/')
  return PRIVATE_UI_MODULES.some((module) => normalizedId.endsWith(module))
}

// Fail the build if a later static import exposes a private screen again.
function verifyPrivateUiPlugin(): Plugin {
  return {
    name: 'picare-verify-private-ui',
    apply: 'build',
    generateBundle(_options, bundle) {
      for (const asset of Object.values(bundle)) {
        if (asset.type !== 'chunk') continue
        if (
          Object.keys(asset.modules).some(isPrivateUiModule) &&
          (!asset.fileName.startsWith('protected/') || asset.isEntry)
        ) {
          this.error(`Private UI code leaked into public bundle: ${asset.fileName}`)
        }
        if (
          !asset.fileName.startsWith('protected/') &&
          asset.imports.some((file) => file.startsWith('protected/'))
        ) {
          this.error(`Public chunk eagerly imports private UI: ${asset.fileName}`)
        }
      }
    },
  }
}

const PROTECTED_ANIMATION_PATHS = [
  '/src/components/animations-ui/',
  '/src/components/animations/',
  '/src/components/loading/',
  '/src/components/reactbit/',
  '/src/components/custom_ui/',
  '/src/components/custom-ui/GhostFibers.tsx',
  '/src/components/custom-ui/ReflectiveCard.tsx',
  '/src/components/finance/PaymentRequestPaper.tsx',
]

function minifyGlslTemplateLiterals(code: string): string {
  const glslHint = /\b(?:void\s+main\s*\(|precision\s+(?:highp|mediump|lowp)\s+float|uniform\s+(?:sampler2D|vec[234]|float|mat[234]|int)|gl_Position|gl_FragColor|fragColor)\b/

  return code.replace(/`((?:\\.|[^`\\])*)`/g, (fullMatch, inner: string) => {
    // Bỏ qua các template literal có chứa biểu thức JS phức tạp hoặc không phải GLSL
    if (!glslHint.test(inner)) return fullMatch
    if (/\$\{[^}]*[`'"\n]/.test(inner)) return fullMatch

    // Xóa comment khối /* ... */
    const withoutBlockComments = inner.replace(/\/\*[\s\S]*?\*\//g, '')
    const lines = withoutBlockComments.split(/\r?\n/)
    const out: string[] = []

    for (const rawLine of lines) {
      // Xóa comment dòng // ... (tránh đụng vào chuỗi nội suy nếu có)
      const line = rawLine.replace(/(^|[^:])\/\/.*$/, '$1').trim()
      if (!line) continue

      // Chỉ thị tiền xử lý GLSL (#version, #define, #ifdef...) bắt buộc nằm trên dòng riêng
      if (line.startsWith('#')) {
        if (out.length > 0 && !out[out.length - 1].endsWith('\n')) {
          out.push('\n')
        }
        out.push(`${line}\n`)
      } else {
        const compactLine = line.replace(/\s+/g, ' ')
        const prev = out[out.length - 1]
        const needSpace =
          prev &&
          !prev.endsWith('\n') &&
          !/[;{}(),]$/.test(prev) &&
          !/^[;{}(),]/.test(compactLine)
        out.push((needSpace ? ' ' : '') + compactLine)
      }
    }

    return `\`${out.join('')}\``
  })
}

function protectAnimationsPlugin(): Plugin {
  return {
    name: 'picare-protect-animations',
    apply: 'build',
    enforce: 'post',
    transform(code, id) {
      if (id.includes('node_modules') || id.includes('?')) return null

      const normalizedId = id.replace(/\\/g, '/')
      if (!/\.[jt]sx?$/.test(normalizedId)) return null

      const isProtected = PROTECTED_ANIMATION_PATHS.some((segment) =>
        normalizedId.includes(segment),
      )
      if (!isProtected) return null

      // Tuyệt đối không can thiệp nếu file có dynamic import() hoặc import.meta
      // để bảo toàn 100% cơ chế chunk preloading của Vite
      if (/\bimport\s*\(|\bimport\.meta\b/.test(code)) return null

      const glslCompacted = minifyGlslTemplateLiterals(code)

      const obfuscated = JavaScriptObfuscator.obfuscate(glslCompacted, {
        compact: true,
        ignoreImports: true,
        renameGlobals: false,
        selfDefending: false,
        debugProtection: false,
        deadCodeInjection: false,
        controlFlowFlattening: false,
        identifierNamesGenerator: 'hexadecimal',
        numbersToExpressions: true,
        simplify: true,
        stringArray: true,
        stringArrayCallsTransform: true,
        stringArrayCallsTransformThreshold: 0.75,
        stringArrayEncoding: ['rc4'],
        stringArrayIndexShift: true,
        stringArrayRotate: true,
        stringArrayShuffle: true,
        stringArrayWrappersCount: 2,
        stringArrayWrappersChainedCalls: true,
        stringArrayWrappersParametersMaxCount: 4,
        stringArrayWrappersType: 'function',
        stringArrayThreshold: 1,
        splitStrings: true,
        splitStringsChunkLength: 6,
        transformObjectKeys: true,
        unicodeEscapeSequence: false,
      })

      return {
        code: obfuscated.getObfuscatedCode(),
        map: null,
      }
    },
  }
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: [['babel-plugin-react-compiler']],
      },
    }),
    tailwindcss(),
    protectAnimationsPlugin(),
    verifyPrivateUiPlugin(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    manifest: true,
    rollupOptions: {
      output: {
        chunkFileNames: (chunk) =>
          chunk.moduleIds.some(isPrivateUiModule)
            ? 'protected/[name]-[hash].js'
            : 'assets/[name]-[hash].js',
      },
    },
    minify: 'terser',
    sourcemap: false, // Tắt hoàn toàn source map trên production
    terserOptions: {
      compress: {
        drop_console: true,
        drop_debugger: true,
        passes: 3,
      },
      mangle: {
        toplevel: true,
        keep_classnames: false,
        keep_fnames: false,
      },
      format: {
        comments: false,
      },
    },
  },
})
