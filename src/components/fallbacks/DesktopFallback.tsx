import { QRCodeSVG } from 'qrcode.react'
import { shareableUrl } from '../../lib/detect'
import { DeviceIcon } from '../Icons'
import FallbackShell from './FallbackShell'

export default function DesktopFallback() {
  const url = shareableUrl()
  return (
    <FallbackShell icon={<DeviceIcon size={26} />} title="Claire is made for phones and tablets">
      <p>It uses your rear camera to make the screen look transparent. Scan to open it on your phone.</p>
      <div className="mx-auto mt-6 w-fit rounded-3xl bg-white p-4 shadow-lg">
        <QRCodeSVG value={url} size={176} bgColor="#ffffff" fgColor="#0a0a0f" level="M" marginSize={0} />
      </div>
      <p className="selectable mt-4 break-all text-xs text-white/55">{url}</p>
    </FallbackShell>
  )
}
