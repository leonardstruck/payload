import React, { useCallback, useEffect, useState } from 'react'
import { useTranslation } from 'react-i18next'

import type { FieldTypes } from '..'
import type { SanitizedCollectionConfig } from '../../../../../collections/config/types'
import type { FilterOptions, UploadField } from '../../../../../fields/config/types'
import type { DocumentDrawerProps } from '../../../elements/DocumentDrawer/types'
import type { ListDrawerProps } from '../../../elements/ListDrawer/types'
import type { Description } from '../../FieldDescription/types'
import type { FilterOptionsResult } from '../Relationship/types'

import { getTranslation } from '../../../../../utilities/getTranslation'
import Button from '../../../elements/Button'
import { useDocumentDrawer } from '../../../elements/DocumentDrawer'
import FileDetails from '../../../elements/FileDetails'
import { useListDrawer } from '../../../elements/ListDrawer'
import { GetFilterOptions } from '../../../utilities/GetFilterOptions'
import Error from '../../Error'
import FieldDescription from '../../FieldDescription'
import Label from '../../Label'
import './index.scss'
import { fieldBaseClass } from '../shared'

const baseClass = 'upload'

export type UploadInputProps = Omit<UploadField, 'type'> & {
  api?: string
  className?: string
  collection?: SanitizedCollectionConfig
  description?: Description
  errorMessage?: string
  fieldTypes?: FieldTypes
  filterOptions: FilterOptions
  onChange?: (e) => void
  path: string
  placeholder?: string
  readOnly?: boolean
  required?: boolean
  serverURL?: string
  showError?: boolean
  style?: React.CSSProperties
  value?: string
  width?: string
}

const UploadInput: React.FC<UploadInputProps> = (props) => {
  const {
    api = '/api',
    className,
    collection,
    description,
    errorMessage,
    filterOptions,
    label,
    onChange,
    path,
    readOnly,
    relationTo,
    required,
    serverURL = 'http://localhost:3000',
    showError,
    style,
    value,
    width,
  } = props

  const { i18n, t } = useTranslation('fields')

  const [file, setFile] = useState(undefined)
  const [missingFile, setMissingFile] = useState(false)
  const [collectionSlugs] = useState([collection?.slug])
  const [filterOptionsResult, setFilterOptionsResult] = useState<FilterOptionsResult>()

  const [DocumentDrawer, DocumentDrawerToggler, { closeDrawer }] = useDocumentDrawer({
    collectionSlug: collectionSlugs[0],
  })

  const [ListDrawer, ListDrawerToggler, { closeDrawer: closeListDrawer }] = useListDrawer({
    collectionSlugs,
    filterOptions: filterOptionsResult,
  })

  useEffect(() => {
    if (typeof value === 'string' && value !== '') {
      const fetchFile = async () => {
        const response = await fetch(`${serverURL}${api}/${relationTo}/${value}`, {
          credentials: 'include',
          headers: {
            'Accept-Language': i18n.language,
          },
        })
        if (response.ok) {
          const json = await response.json()
          setFile(json)
        } else {
          setMissingFile(true)
          setFile(undefined)
        }
      }

      fetchFile()
    } else {
      setFile(undefined)
    }
  }, [value, relationTo, api, serverURL, i18n])

  const onSave = useCallback<DocumentDrawerProps['onSave']>(
    (args) => {
      setMissingFile(false)
      onChange(args.doc)
      closeDrawer()
    },
    [onChange, closeDrawer],
  )

  const onSelect = useCallback<ListDrawerProps['onSelect']>(
    (args) => {
      setMissingFile(false)
      onChange({
        id: args.docID,
      })
      closeListDrawer()
    },
    [onChange, closeListDrawer],
  )

  return (
    <div
      className={[
        fieldBaseClass,
        baseClass,
        className,
        showError && 'error',
        readOnly && 'read-only',
      ]
        .filter(Boolean)
        .join(' ')}
      style={{
        ...style,
        width,
      }}
    >
      <GetFilterOptions
        {...{
          filterOptions,
          filterOptionsResult,
          path,
          relationTo,
          setFilterOptionsResult,
        }}
      />
      <Error message={errorMessage} showError={showError} />
      <Label htmlFor={`field-${path.replace(/\./g, '__')}`} label={label} required={required} />
      {collection?.upload && (
        <React.Fragment>
          {file && !missingFile && (
            <FileDetails
              collection={collection}
              doc={file}
              handleRemove={
                readOnly
                  ? undefined
                  : () => {
                      onChange(null)
                    }
              }
            />
          )}
          {(!file || missingFile) && (
            <div className={`${baseClass}__wrap`}>
              <div className={`${baseClass}__buttons`}>
                <DocumentDrawerToggler className={`${baseClass}__toggler`} disabled={readOnly}>
                  <Button buttonStyle="secondary" disabled={readOnly} el="div">
                    {t('uploadNewLabel', {
                      label: getTranslation(collection.labels.singular, i18n),
                    })}
                  </Button>
                </DocumentDrawerToggler>
                <ListDrawerToggler className={`${baseClass}__toggler`} disabled={readOnly}>
                  <Button buttonStyle="secondary" disabled={readOnly} el="div">
                    {t('chooseFromExisting')}
                  </Button>
                </ListDrawerToggler>
              </div>
            </div>
          )}
          <FieldDescription description={description} value={file} />
        </React.Fragment>
      )}
      {!readOnly && <DocumentDrawer onSave={onSave} />}
      {!readOnly && <ListDrawer onSelect={onSelect} />}
    </div>
  )
}

export default UploadInput
