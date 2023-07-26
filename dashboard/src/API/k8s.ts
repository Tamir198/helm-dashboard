import { UseQueryOptions, useQuery } from '@tanstack/react-query'
import { callApi } from './releases'
import { K8sResource, K8sResourceList, KubectlContexts } from './interfaces'

// Get list of kubectl contexts configured locally
function useGetKubectlContexts(options?: UseQueryOptions<KubectlContexts>) {
    return useQuery<KubectlContexts>(
        ['k8s', 'contexts'],
        () => callApi<KubectlContexts>('/api/k8s/contexts'),
        options
    )
}

// Get resources information
function useGetK8sResource(
    kind: string,
    name: string,
    namespace: string,
    options?: UseQueryOptions<K8sResource>
) {
    return useQuery<K8sResource>(
        ['k8s', kind, 'get', name, namespace],
        () =>
            callApi<K8sResource>(
                `/api/k8s/${kind}/get?name=${name}&namespace=${namespace}`
            ),
        options
    )
}

// Get list of resources
function useGetK8sResourceList(
    kind: string,
    options?: UseQueryOptions<K8sResourceList>
) {
    return useQuery<K8sResourceList>(
        ['k8s', kind, 'list'],
        () => callApi<K8sResourceList>(`/api/k8s/${kind}/list`),
        options
    )
}

// Get describe text for kubernetes resource
function useGetK8sResourceDescribe(
    kind: string,
    name: string,
    namespace: string,
    options?: UseQueryOptions<string>
) {
    return useQuery<string>(
        ['k8s', kind, 'describe', name, namespace],
        () =>
            callApi<string>(
                `/api/k8s/${kind}/describe?name=${name}&namespace=${namespace}`,
                {
                    headers: {
                        Accept: 'text/plain',
                    },
                }
            ),
        options
    )
}
