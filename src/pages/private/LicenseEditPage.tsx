import { useParams } from "react-router-dom";

import LicenseCreatePage from "@/pages/private/LicenseCreatePage";

export default function LicenseEditPage() {
  const { licenseId = "" } = useParams<{ licenseId: string }>();

  return <LicenseCreatePage mode="edit" licenseId={licenseId} />;
}
