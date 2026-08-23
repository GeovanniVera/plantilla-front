import { useState, useCallback, type ReactNode } from 'react'
import { LuCopy, LuCheck, LuFileCode2 } from 'react-icons/lu'
import Card from '@components/layout/Card'
import styles from './Showcase.module.css'

// ─── CopyButton ───────────────────────────────────────────
export function CopyButton({ text }: { text: string }) {
    const [copied, setCopied] = useState(false)
    const handleCopy = useCallback(async () => {
        await navigator.clipboard.writeText(text)
        setCopied(true)
        setTimeout(() => setCopied(false), 2000)
    }, [text])
    return (
        <button
            className={`${styles.copyBtn} ${copied ? styles.copyBtnCopied : ''}`}
            onClick={handleCopy}
        >
            {copied ? <LuCheck size={14} /> : <LuCopy size={14} />}
            {copied ? 'Copiado' : 'Copiar'}
        </button>
    )
}

// ─── CodeBlock ────────────────────────────────────────────
export function CodeBlock({ filename, code }: { filename: string; code: string }) {
    return (
        <div className={styles.codeBlock}>
            <div className={styles.codeHeader}>
                <span className={styles.codeFilename}>
                    <span className={styles.codeFilenameIcon}>
                        <LuFileCode2 size={14} />
                    </span>
                    {filename}
                </span>
                <CopyButton text={code} />
            </div>
            <pre className={styles.codeContent}>{code}</pre>
        </div>
    )
}

// ─── ExampleCard ──────────────────────────────────────────
interface ExampleCardProps {
    title: string
    desc: string
    children: ReactNode
    code: string
    filename: string
    previewClassName?: string
}

export function ExampleCard({
    title,
    desc,
    children,
    code,
    filename,
    previewClassName,
}: ExampleCardProps) {
    const [showCode, setShowCode] = useState(false)

    return (
        <Card variant="outlined" className={styles.exampleCard}>
            <div className={styles.exampleCardBody}>
                <div className={styles.exampleCardTop}>
                    <div className={styles.exampleCardInfo}>
                        <div className={styles.exampleCardTitle}>{title}</div>
                        <div className={styles.exampleCardDesc}>{desc}</div>
                    </div>
                    <button
                        onClick={() => setShowCode(!showCode)}
                        className={`${styles.codeToggleBtn} ${showCode ? styles.codeToggleBtnActive : styles.codeToggleBtnIdle}`}
                    >
                        <LuFileCode2 size={14} />
                        {showCode ? 'Ver ejemplo' : 'Ver código'}
                    </button>
                </div>
                {showCode ? (
                    <CodeBlock filename={filename} code={code} />
                ) : (
                    <div className={styles.previewArea}>
                        {previewClassName ? (
                            <div className={previewClassName}>{children}</div>
                        ) : (
                            children
                        )}
                    </div>
                )}
            </div>
        </Card>
    )
}
