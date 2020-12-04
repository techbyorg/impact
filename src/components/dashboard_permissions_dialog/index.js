import { z, useContext, useMemo, useStream } from 'zorium'
import * as Rx from 'rxjs'
import * as rx from 'rxjs/operators'
import * as _ from 'lodash-es'

import $button from 'frontend-shared/components/button'
import $dialog from 'frontend-shared/components/dialog'
import $dropdown from 'frontend-shared/components/dropdown'
import $permissionToggle from 'frontend-shared/components/permission_toggle'
import { streams } from 'frontend-shared/services/obs'

import context from '../../context'

if (typeof window !== 'undefined' && window !== null) {
  require('./index.styl')
}

export default function $newDashboardDialog ({ dashboardIdStream, onClose }) {
  const { lang, model } = useContext(context)

  const {
    unselectedRolesStreams, dashboardRolesStream, dashboardPermissionsStream,
    selectedAddRoleIdStream, selectedRoleIdStreams
  } = useMemo(() => {
    const allDashboardPermissionsStream = dashboardIdStream.pipe(
      rx.switchMap((id) => {
        // FIXME: create permission model or go through all roles and see which have perm for this dash
        return id
          ? model.permission.getBySourceTypeAndSourceId('impact-dashboard', id)
          : Rx.of(null)
      })
    )

    const dashboardRolesStream = allDashboardPermissionsStream.pipe(
      rx.map((permissions) => {
        return _.uniqBy(_.map(permissions?.nodes, 'role'), 'id')
      })
    )

    const unselectedRolesStreams = Rx.combineLatest(
      model.role.getAll(),
      dashboardRolesStream
    ).pipe(
      rx.map(([roles, dashboardRoles]) =>
        _.filter(roles?.nodes, (role) =>
          !_.find(dashboardRoles, { id: role.id })
        )
      )
    )

    const selectedRoleIdStreams = streams(dashboardRolesStream.pipe(
      rx.map((dashboardRoles) => dashboardRoles?.[0]?.id)
    ))

    const allDashboardPermissionsAndSelectedRoleId = Rx.combineLatest(
      allDashboardPermissionsStream, selectedRoleIdStreams.stream
    )

    const dashboardPermissionsStream = allDashboardPermissionsAndSelectedRoleId.pipe(
      rx.map(([allDashboardPermissions, selectedRoleId]) => {
        const viewPermission = _.find(allDashboardPermissions?.nodes, {
          roleId: selectedRoleId, permission: 'view'
        })
        const editPermission = _.find(allDashboardPermissions?.nodes, {
          roleId: selectedRoleId, permission: 'edit'
        })
        return [
          {
            name: lang.get('permissionType.view'),
            permission: 'view',
            key: Math.random(), // HACK: $permissionToggle needs to be remounted any time this is updated
            valueStream: new Rx.BehaviorSubject(viewPermission?.value)
          },
          {
            name: lang.get('permissionType.edit'),
            permission: 'edit',
            key: Math.random(), // HACK: $permissionToggle needs to be remounted any time this is updated
            valueStream: new Rx.BehaviorSubject(editPermission?.value)
          }
        ]
      })
    )

    return {
      unselectedRolesStreams,
      dashboardRolesStream,
      dashboardPermissionsStream,
      selectedAddRoleIdStream: new Rx.BehaviorSubject(null),
      selectedRoleIdStreams
    }
  }, [])

  const {
    unselectedRoles, dashboardRoles, dashboardPermissions,
    selectedAddRoleId, dashboardId, selectedRoleId
  } = useStream(() => ({
    unselectedRoles: unselectedRolesStreams,
    dashboardRoles: dashboardRolesStream,
    dashboardPermissions: dashboardPermissionsStream,
    dashboardId: dashboardIdStream,
    selectedAddRoleId: selectedAddRoleIdStream,
    selectedRoleId: selectedRoleIdStreams.stream
  }))

  const addRole = () => {
    model.permission.upsert({
      roleId: selectedAddRoleId,
      sourceType: 'impact-dashboard',
      sourceId: dashboardId,
      permission: 'view',
      value: true
    })
  }

  const updatePermissions = async () => {
    // await model.role.upsert
    model.permission.batchUpsert(
      _.map(dashboardPermissions, ({ permission, valueStream }) => ({
        sourceType: 'impact-dashboard',
        sourceId: dashboardId,
        roleId: selectedRoleId,
        permission,
        value: valueStream.getValue()
      }))
    )
    onClose()
  }

  return z('.z-new-dashboard-dialog', [
    z($dialog, {
      onClose,
      $title: lang.get('dashboardPermissionsDialog.title'),
      $content:
        z('.z-new-dashboard-dialog_content', [
          z('.add-role', [
            z($dropdown, {
              valueStream: selectedAddRoleIdStream,
              options: _.map(unselectedRoles, ({ id, name }) => ({
                value: id,
                text: name
              }))
            }),
            z($button, {
              onclick: addRole,
              text: lang.get('general.add'),
              isFullWidth: false
            })
          ]),
          !_.isEmpty(dashboardRoles) && [
            z('.role-dropdown', [
              z($dropdown, {
                valueStreams: selectedRoleIdStreams,
                options: _.map(dashboardRoles, ({ id, name }) => ({
                  value: id,
                  text: name
                }))
              })
            ]),
            z('.permissons', _.map(dashboardPermissions, (perm) => {
              const { name, key, valueStream } = perm
              return z('.permission', { key }, [
                z('.name', name),
                z($permissionToggle, {
                  valueStream
                })
              ])
            }))
          ]
        ]), // view / edit 3-way toggles
      $actions:
        z('.z-dashboard-dialog_actions', [
          z('.save', [
            z($button, {
              text: lang.get('general.save'),
              isPrimary: true,
              onclick: updatePermissions,
              shouldHandleLoading: true
            })
          ])
        ])
    })
  ])
};
