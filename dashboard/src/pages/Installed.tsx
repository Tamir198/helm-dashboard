import InstalledPackagesHeader from "../components/InstalledPackages/InstalledPackagesHeader";
import InstalledPackagesList from "../components/InstalledPackages/InstalledPackagesList";
import ClustersList from "../components/ClustersList";
import { useGetInstalledReleases } from "../API/releases";
import { useEffect, useMemo, useState } from "react";
import Spinner from "../components/Spinner";
import useAlertError from "../hooks/useAlertError";
import { useParams, useNavigate } from "react-router-dom";
import useCustomSearchParams from "../hooks/useCustomSearchParams";
import { Release } from "../data/types";

function Installed() {
  const { searchParamsObject, upsertSearchParams } = useCustomSearchParams();
  const { context } = useParams();
  const { filteredNamespace } = searchParamsObject;
  const selectedNamespaces = useMemo(
    () => filteredNamespace?.split("+"),
    [filteredNamespace]
  );
  const navigate = useNavigate();

  useEffect(() => {
    if (filteredNamespace === undefined) {
      upsertSearchParams("filteredNamespace", "default");
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // The dep array is empty on purpose, we want to run it only the initial load

  const handleClusterChange = (
    clusterName: string,
    clusterNamespaces: string[] = []
  ) => {
    const newSearchParams = upsertSearchParams(
      "filteredNamespace",
      clusterNamespaces.length > 0
        ? `${clusterNamespaces.map((ns) => ns).join("+")}`
        : "default"
    );
    navigate({
      pathname: `/${clusterName}/installed`,
      search: newSearchParams.toString(),
    });
  };

  const [filterKey, setFilterKey] = useState<string>("");
  const alertError = useAlertError();
  const { data, isLoading, isRefetching } = useGetInstalledReleases(
    context ?? "",
    {
      retry: false,
      onError: (e) => {
        alertError.setShowErrorModal({
          title: "Failed to get list of charts",
          msg: (e as Error).message,
        });
      },
    }
  );

  const filteredReleases = useMemo(() => {
    return (
      data?.filter((installedPackage: Release) => {
        if (filterKey) {
          return (
            installedPackage.name.includes(filterKey) ||
            (installedPackage.namespace.includes(filterKey) &&
            selectedNamespaces
              ? selectedNamespaces.includes(installedPackage.namespace)
              : true)
          );
        } else {
          return selectedNamespaces
            ? selectedNamespaces.includes(installedPackage.namespace)
            : true;
        }
      }) ?? []
    );
  }, [data, filterKey, selectedNamespaces]);

  return (
    <div className="flex flex-row w-full">
      <ClustersList
        selectedCluster={context ?? ""}
        filteredNamespaces={selectedNamespaces}
        onClusterChange={handleClusterChange}
        installedReleases={data}
      />

      <div className="p-5 w-[calc(100%-17rem)]">
        <InstalledPackagesHeader
          isLoading={isLoading || isRefetching}
          filteredReleases={filteredReleases}
          setFilterKey={setFilterKey}
        />

        {isLoading || isRefetching ? (
          <div className="py-2">
            <Spinner />
          </div>
        ) : (
          <InstalledPackagesList filteredReleases={filteredReleases} />
        )}
      </div>
    </div>
  );
}

export default Installed;
